---
title: "리포지토리 패턴과 엔티티 프레임워크 코어"
excerpt_separator: "<!--more-->"
categories:
  - Korean
tags:
  - repository-pattern
  - unit-of-work-pattern
  - design-pattern
  - ef-core
---
리포지토리, 유닛오브워크 패턴은 디자인 패턴중에서 아마 가장 많이 알려진 패턴이 아닐까 생각한다. 애플리케이션을 만들면서 데이터를 다루는 일은 빠질 수 없는 요소인데 ORM 사용여부와 이 패턴 사용여부가 초기 프로젝트 셋업에서 중요한 결정요소 중 하나이다. 

Entity Framework Core의 등장과 함께 리포지토리 / 유닛오브워크 패턴이 필요하지 않다는 주장도 많다. 어떤 상황에서든 최선일 수 있는 한 가지 솔루션이 있으면 좋겠지만 팀 구성과 프로젝트 일정에 따라 솔루션은 언제나 다를 수 있다. 이 글은 어떤 경우에 패턴을 사용하는 것이 유리한지, 장점은 무엇인지 알아봄으로써 결정의 순간에 도움이 되기를 바란다.

<!--more-->

## EF Core vs. 패턴

전문가들은 리포지터리 패턴에 대해 어떻게 생각하고 있을까?

> I'm over Repositories, and definitely over abstracting your data layer. 한 때는 리포지토리를 사용했지만 지금은 아니다. 더 이상 데이터 레이어를 추상화하지 않는다.
> 
> [Jimmy Borad](https://jimmybogard.com/)

> No, you don't need a repository. But there are many benefits and you should consider it. 리토지토리가 꼭 필요하지는 않다. 그러나, 많은 장점이 있기 때문에 고려해봐야 한다.
> 
> [Steve Smith](https://deviq.com/me/steve-smith/)


> No, the repository/unit-of-work pattern isn't useful with EF Core. 그 패턴은 EF Core를 사용하면서 쓸모없다.
> 
> [John Smith](https://www.thereformedprogrammer.net/)

전반적인 의견을 봤을 때 이 패턴은 *더이상 굳이* 필요하지 않은 것 처럼 들린다. 그 배경에는 다음과 같은 생각들이 있다.
1. 패턴을 구현하기 위해 코딩을 더해야 한다.
2. EF Core의 `DbContext`는 Unit-Of-Work 처럼 동작한다.
3. `DbSet` 또한 리포지토리 처럼 동작한다.
4. 리포지토리가 없으면 단위 테스트가 힘든데, EF Core는 단위 테스트를 위한 기능을 제공한다.

Steve는 중도적인 입장이며 패턴의 장점을 놓치지 말라고 한다. 내가 생각하는 패턴의 장점은,
1. `DbContex`를 경험이 부족한 개발자에게 직접 노출시키는 위험을 줄일 수 있다.
2. 리포지토리에서 제공하는 메서드만으로 데이터 변경을 허용하면 코드 재사용성을 높일 수 있고 품질관리를 할 수 있다.
3. 패턴을 사용하여 ORM을 감싼다면, EF Core를 사용하다가 NHibernate로 옮겨 갈때 클라이언트 코드는 변경하지 않아도 된다. 클라이언트 코드는 패턴을 사용하기 때문에 ORM에 종속적이지 않다.

*리포지토리 패턴이 유용했던 시대가 있었다. Raw SQL을 사용하거나 스토어드 프로시져를 혼용해 사용하거나 해서 데이터 액세스에 통일된 원칙을 제공해야 했을 때, 또는 개발자에게 SQL을 다루는 부담을 줄이기 위해 유용하게 사용되었다. ORM을 사용하면서부터는 데이터보다는 코드 관점에서 생각하게 되었다. 리포지토리를 바라보는 관점이 오브젝트 컬렉션으로 바뀌면서 패턴은 굳이 필요없게 된 것이 아닐까.*

아뭏든 당신이 프로젝트 리더라면 패턴의 장점을 프로젝트 팀의 구성과 함께 생각해 볼 필요가 있겠다. 팀 구성에 주니어 개발자가 다수 포함되어 있고 ORM의 경험이 없다면, 그리고 시니어에게 패턴을 구현하고 관리할 여력이 있다면 패턴을 사용하는 것이 개발 퍼포먼스에 긍정적으로 작용할 것이다. 

반면, 팀 구성이 시니어 위주고 그들의 EF Core에 대한 이해도가 높다면 패턴의 장점은 희석되므로 오히려 시니어 개발자에게 보다 많은 자유도를 허용하는 것이 좋을 것이다.

## EF Core는 이미 리포지토리/유닛오브워크 패턴을 구현하고 있다?

EF Core를 패턴 구현의 관점에서 살펴보자. 아래 코드는 [공식 사이트](https://docs.microsoft.com/en-us/ef/core/)에서 가져왔다. 블로그를 조회하고 추가하는 아주 간단한 사용예다.

```csharp
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

public class BloggingContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<Post> Posts { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(
            @"Server=(localdb)\mssqllocaldb;Database=Blogging;Integrated Security=True");
    }
}

public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
    public int Rating { get; set; }
    public List<Post> Posts { get; set; }
}

public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    public int BlogId { get; set; }
    public Blog Blog { get; set; }
}
```

```csharp
using (var db = new BloggingContext())
{
    // 조회
    var blogs = db.Blogs
        .Where(b => b.Rating > 3)
        .OrderBy(b => b.Url)
        .ToList();
}
```

```csharp
using (var db = new BloggingContext())
{
    // 저장
    var blog = new Blog { Url = "http://sample.com" };
    db.Blogs.Add(blog);
    db.SaveChanges();
}
```

위 코드를 Post는 생략하고 리포지토리/유닛오브워크 패턴으로 바꿔보았다.

```csharp
public class UnitOfWork : IDisposable
{
    public BlogRepository Blogs { get; set; }
    public PostRepository Posts { get; set; }

    public UnitOfWork()
    {
        Blogs = new BlogRepository();
        Posts = new PostRepository();
    }
    
    public void SaveChanges()
    {
        // 모든 리포지토리의 변경된 내용 저장
    }

    public void Dispose()
    {
        // 외부 리소스 - 데이터베이스, 파일등 리소스 처리
    }
}

public class BlogRepository
{
    private List<Blog> blogs = new List<Blog>();

    public void Add(Blog entity) => blogs.Add(entity);

    public void Remove(Blog entity) => blogs.Remove(entity);

    public IEnumerable<Blog> GetBlogsWithRatingGreaterThan(int rating) => 
        blogs.Where(b => b.Rating > 3).OrderBy(b => b.Url).ToList();
}

public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
    public int Rating { get; set; }
    public List<Post> Posts { get; set; }
}

public class Post 
{
    // 생략
}
```

그리고 클라이언트 코드에서 다음과 같이 사용할 수 있겠다.

```csharp
// 조회
using (var uow = new UnitOfWork())
{
    var blogs = uow.Blogs.GetBlogsWithRatingGreaterThan(3);
}

// 저장
using (var uow = new UnitOfWork())
{
    var blog = new Blog { Url = "http://sample.com"};
    uow.Blogs.Add(blog);
    uow.SaveChanges();
}
```

구조가 거의 똑같고 사용 예도 유사하다. 이런 점 때문에 패턴의 필요성이 떨어지는 것 같다. 하지만, 패턴은 내가 원하는대로 커스터마이징할 수 있고 Aggregate 작성도 쉽다는 장점이 있다. 또한 코딩 스타일이 만들어 내는 차이도 존재한다.

## 코딩에서 보이는 패턴의 장점

#### 적은 코드 중복

```csharp
var blogs = db.Blogs
    .Where(b => b.Rating > 1)
    .OrderBy(b => b.Url)
    .ToList();

var blogs = db.Blogs
    .Where(b => b.Rating > 3)
    .OrderBy(b => b.Url)
    .ToList();

// vs.

var blogs = uow.Blogs.GetBlogsWithRatingGreaterThan(1);
var blogs = uow.Blogs.GetBlogsWithRatingGreaterThan(3);
```

같은 쿼리면서 조건만 조금 다르게 사용하는 경우, 그 조건을 파라미터로 만들면 코드 중복을 막을 수 있다.

#### 가독성
LINQ를 해석하는 것보다는 의미있는 메서드명이 읽기 쉽다. 유닛 테스트를 작성할 때도 `new Mock<DbSet<Blog>>()` 보다는 리포지토리를 사용하는 쪽이 보기에 편하다.

#### 관리 포인트
정렬 순서를 ACS에서 DESC으로 바꾼다고 가정해 보자. 리포지토리가 있다면 한 곳에서만 변경하면 된다.

#### Aggregate 엔티티
만약 Post 엔티티와 Blog 엔티티를 하나의 리포지토리로 묶어야 한다고 가정할 때, EF Core에서는 어떻게 해야 할지 막막하다. 몇 개의 `DbSet<T>`을 묶는 개념이 존재하는지 모르겠다. 반면 리포지토리에서는 간단하게 처리할 수 있다. [이어지는 포스트]() 에서 그 구현을 확인할 수 있다.

## 결론

패턴을 원한다면 EF Core와 함께 사용하도록 구성하는 것이 매우 쉽다. EF Core가 이미 패턴이 정의하는 방식대로 동작하기 때문에 구성도 쉽고 대부분의 작업을 위임하면 그만이기 때문이다. 어떻게 구현하는지는 [이어지는 포스트]()에서 구현된 모습을 확인할 수 있다.

팀 구성과 프로젝트의 크기가 패턴의 사용여부를 결정하는 중요한 요소일 것이다. 아니면, 리더쉽의 개인적인 취향도 무시할 수는 없다.  

마틴 파울러가 생각하는 리포지토리의 정의와 함께 이 글을 맺는다.

> A repository performs the tasks of an intermediary between the domain model layers and data mapping, acting in a similar way to a set of domain objects in memory. Client objects declaratively build queries and send them to the repositories for answers. Conceptually, a repository encapsulates a set of objects stored in the database and operations that can be performed on them, providing a way that is closer to the persistence layer. Repositories, also, support the purpose of separating, clearly and in one direction, the dependency between the work domain and the data allocation or mapping.
> 
> 리포지토리는 도메인 모델 레이어와 데이터 매핑 사이에서 중재자 역할을 한다. 마치 메모리에 존재하는 도메인 객체의 컬렉션을 사용하는 것과 유사하다. 리포지토리를 사용하는 클라이언트 객체는 선언적으로 질의을 만들어 보내고 답을 기다린다. 리포지토리는 저장 레이어와 유사한 방식을 취하면서 데이터베이스의 객체 컬렉션과 그 것을 다루는 오퍼레이션을 캡슐화한다. 또한, 작업 도메인과 데이터 매핑 사이의 종속성을 단방향으로 깔끔하게 분리한다는 목적을 이행하고 있다.
