---
title: "API 버전관리"
date: "2020-04-05"
image: "https://picsum.photos/150/150"
keywords: "api"
excerpt_separator: "<!--more-->"
categories:
  - ko-KR
tags:
  - api
  - aspnet
---
API를 관리하면서 기능 향상이나 추가는 일상적인 요구사항이다. 이때, 기존 호환성을 유지해야 한다면 각기 다른 버전의 API를 제공할 필요가 있다. 마이크로소프트는 `Microsoft.AspNetCore.Mvc.Versioning` 패키지를 통해 ASP.NET Core의 REST API 버전을 쉽게 관리할 수 있도록 도와준다.
<!--more-->

## 설정하기
패키지를 설치한 후, `Startup.cs` 에서 기본적인 행동패턴을 설정하자.

```csharp
// Startup.cs
services.AddApiVersioning(config =>
{
    config.DefaultApiVersion = new ApiVersion(1, 0);
    config.AssumeDefaultVersionWhenUnspecified = true;
    config.ReportApiVersions = true;
    config.ApiVersionReader = new HeaderApiVersionReader("X-Version");
});
```

`AssumeDefaultVersionWhenUnspecified` 속성을 `true`로 활성화하면, 클라이언트 요청에 버전 정보가 없을 경우, 기본 버전을 사용하도록 해준다. 이미 상당수의 API를 개발한 후 버전관리를 시작할 때 유용하다. `ReportApiVersions` 속성은 아래 그림과 같이 서버에서 제공하고 있는 API 버전을 보여준다. 응답 헤더에 `api-supported-verions`가 추가된 걸 확인할 수 있다.

![api-supported-versions.png](../images/api/api-supported-versions.png)

위 설정에서는 헤더에서 버전정보를 읽도록 `HeaderApiVersionReader`를 사용했지만, 시나리오에 맞추어 `ApiVersionReader` 속성을 다르게 지정한다.

## 버전 지정하기
클라이언트가 버전을 지정하여 요청하면, 그 요청은 해당하는 컨트롤러와 액션으로 리다이렉트된다. 컨트롤러와 액션에 버전을 지정하는 방식에는 여러 접근법이 있다.

먼저, 버전에 따라 각각의 컨트롤러를 생성할 수 있지만, 아래 예시처럼 컨트롤러 하나에서 여러 버전을 관리할 수도 있다. 만약에 같은 컨트롤에서 여러 버전을 관리한다면 `[MpaToApiVersion]` 어트리뷰트를 통해 액션별로 버전을 매핑해야 한다.

```csharp
[ApiVersion("1.0")]
[ApiVersion("1.1")]
[ApiController]
[Route("[controller]")]
public class JakeController : ControllerBase
{
    [HttpGet("{id}")]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> Get(int id)
    {
        var command = new GetJakeCommand {Id = id};
        var result = await mediator.Send(command);

        return Ok(result);
    }

    [HttpGet("{id}")]
    [MapToApiVersion("1.1")]
    public async Task<IActionResult> GetV1_1(int id)
    {
        var command = new GetJakeCommand {Id = id};
        var result = await mediator.Send(command);

        return Ok(result);
    }
}
```

만약, `MapToApiVersion` 어트리뷰트가 없다면 앞서 설정한 기본 버전을 사용하는 것으로 간주한다. 그래서 `Get` 메서드를 수식하는 `[MapToApiVersion("1.0")]`을 생략할 수도 있다. 
실제 운영에는 문제가 없지만 Swagger UI를 사용할 때, 문제가 되므로 명시적으로 매핑 어트리뷰트를 유지하는 것이 좋다.

## 버전관리 방법

버전관리에는 네가지 방법이 있다. 또한, 그중 몇가지를 섞어서 사용하는 방법도 가능하다. 선택한 방식에 따라 클라이언트에서 요청을 만드는 방식이 달라지고 서버에서도 대응하는 설정을 해야한다.

### 쿼리 스트링
쿼리 파라미터를 사용하는 것이 기본 값이다. 파라미터 명은 `api-version`이고 다음과 같이 사용한다.

```
https://{domain}/api/controller?api-version=1.1
```

기본 값이라 별도 설정이 필요 없지만 명시적인 방식을 선호한다면 다음과 같이 설정한다.

```csharp
config.ApiVersionReader = new QueryStringApiVersionReader();
```

URL이 지저분해지는 단점이 있지만 가장 간단하고 직관적인 방법이다.

### 요청 헤더

클라이언트에서 요청을 만들때, 사용자 헤더를 사용하여 버전을 지정한다.

![x-version](../images/api/x-version.png)

사용자 헤더명을 서버 설정에서 정의한다.

```csharp
config.ApiVersionReader = new HeaderApiVersionReader("X-Version");
```

버전이 숨어 있어 직관적이지 않지만 URL을 조작하지 않아도 되기 때문에 가장 선호되는 방식이다.

### Accept 헤더 재사용 (미디어 타입)
Accept 헤더는 클라이언트가 서버에게 어떤 미디어를 (모든 미디어 `*.*` 또는 `application/json` 처럼 특정 미디어) 원하는지 알릴때 사용한다. 사용자 헤더를 따로 정의하지 않고 아래와 같이 Accept 헤더를 재사용한다.

```
GET /resource/4
Accept: application/json;v=1.1
```

단점이라면 구현만 봤을때, 명확하지 않은 느낌이 있다. 클라이언트에서 구현하는게 용이하지 않을 수도 있다.

```
config.ApiVersionReader = new MediaTypeApiVersionReader();
```

### URL 경로

URL 경로에 명시적으로 버전을 사용하는 방식이다.

```
https://{domain}/api/v1.1/resource
```

리소스(컨트롤러) 앞에 버전이 명시되므로 쿼리 스트링 방식보다도 눈에 더 잘 띈다. API의 버전 변경이 전방위적으로 일어날 때, 모든 리소스의 버전 업그레이드가 동시에 일어나 전체 URL의 버전을 업그레이드하는 상황이 이상적이다. 만약, 버전이 다른 URL을 섞어서 사용한다면 그것이 에러인지 의도적인 것인지 오히려 혼동을 줄 수도 있기 때문이다.

```csharp
config.ApiVersionReader = new UrlSegmentApiVersionReader();

// 컨트롤러에서 라우팅을 변경해야 한다
[Route("api/v{version:apiVersion}/[controller]")]
```

## 멀티 버전 관리

위에서 살펴본 네가지 방식을 섞어서 사용하는 것이 가능하다. 기대 이상의 기능을 `Microsoft.AspNetCore.Mvc.Versioning` 패키지가 제공한다.

```csharp
config.ApiVersionReader = ApiVersionReader.Combine(new HeaderApiVersionReader("X-Version"), new QueryStringApiVersionReader("api-version"));
```

## 지원 종료된 버전 알리기

서버에서 지원 가능한 API 버전을 응답헤더를 통해 내려 줬듯이 더 이상 지원하지 않는 버전도 설정할 수 있다. 클라이언트에서는 `api-deprecated-versions` 헤더에 명시된 버전을 사용하지 않도록 유의해야 한다.

```csharp
[ApiVersion("1.0", Deprecated = true)]
[ApiVersion("1.1")]
[ApiController]
[Route("[controller]")]
public class JakeController : ControllerBase
{
   ...
}
```

![api-deprecated-versions](../images/api//api-deprecated-versions.png)

## 결론

이상 네가지 방식을 통해 각기 사용하거나 섞어 쓰는 방식으로 대부분의 시나리오를 만족시킬 수 있을 것 같다. 개인적으로는 사용자 헤더를 사용하는 방식이 깔끔해 보인다. URL을 깨끗하게 유지할 수 있고, 전용 헤더를 사용하기 때문이다. 다만, URL이 서버단 캐싱에 사용된다면, API 버전 업그레이드시 고려해야 할 것이다.
