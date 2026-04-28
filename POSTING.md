# 포스트 작성 가이드

ddhw.dev 포스트의 일관성을 위한 컨벤션. 새 글 시작할 때
`_drafts/_TEMPLATE.md`를 `_posts/`로 복사해서 채우면 됨.

## 1. 파일명 / 경로

- 위치: `_posts/`
- 파일명: `YYYY-MM-DD-slug.md`
  - 날짜는 작성/발행일
  - slug는 영문 소문자 + 숫자 + 하이픈 (한글 금지 — URL이 깔끔해짐)
- 이미지: `assets/images/posts/<slug>/<filename>` 으로 글마다 폴더 분리

예시:
```
_posts/2026-05-01-spring-jpa-n-plus-1.md
assets/images/posts/spring-jpa-n-plus-1/eager-vs-fetch-join.png
```

## 2. Front matter

필수 필드와 선택 필드 구분.

### 필수
| 필드 | 설명 |
|---|---|
| `title` | 포스트 제목. 따옴표로 감싸기 |
| `date` | `YYYY-MM-DD HH:MM:SS +0900` (KST) — 시각까지 적으면 같은 날 여러 편 정렬 가능 |
| `categories` | 1~2개. 2단계까지 (예: `[Backend, Spring]`) |
| `tags` | 자유. 소문자·하이픈, 5개 이내 권장 |
| `excerpt` | 1~2문장 요약. 카드 / 검색 결과 / OG description에 사용 |

### 선택
| 필드 | 설명 |
|---|---|
| `header.og_image` | 글 전용 OG 이미지(소셜 썸네일). 없으면 사이트 기본값 사용 |
| `header.teaser` | 카드/아카이브에 보이는 작은 썸네일 |
| `toc: false` | 기본값 true. 짧은 글이라 목차 불필요할 때 끄기 |
| `pin: true` | 홈 상단에 고정 |
| `last_modified_at` | `YYYY-MM-DD HH:MM:SS +0900` — 수정 이력 표시 |

## 3. 카테고리 / 태그 운영

- **카테고리 = 글이 속하는 큰 영역** (변동 적음). 한 글 = 1~2개
  - 예: `Backend`, `Frontend`, `Infra`, `Meta`, `Note`
- **태그 = 검색 / 필터용 키워드** (자유롭게 늘어남). 한 글 = 1~5개
  - 예: `jpa`, `nginx`, `react-hooks`

## 4. 본문 구조

### 헤딩
- H1은 `title`이 자동 생성하므로 본문은 **H2(`##`)부터** 시작
- 헤딩 깊이는 H4까지만. 그 이상은 글 구조를 다시 보기

```markdown
## 큰 단락

### 세부 항목

#### 더 세부
```

### 도입부 패턴
글 첫 단락은 "왜 이 글을 쓰는지 / 무엇을 다룰지" 한 문단으로.
바로 본론 → 결론 → (선택) 더 읽기 순서.

### 인용
```markdown
> 인용은 좌측 accent 바 + 약한 배경으로 강조됨.
```

### 코드
- 언어 지정 필수 (` ```ruby ` 식). 신택스 하이라이트가 적용됨
- 인라인 코드는 `` `백틱` `` 으로

```markdown
```ruby
def hello(name)
  "Hi, #{name}"
end
```
```

### 이미지
- 모든 이미지에 alt 텍스트 필수
- 캡션 필요하면 figure 이용

```markdown
![JPA fetch 전략 비교](/assets/images/posts/spring-jpa-n-plus-1/eager-vs-fetch-join.png)
```

### 표
- 마크다운 표 사용. 모바일에서는 자동으로 가로 스크롤됨

### 링크
- 외부: `[텍스트](https://example.com)`
- 내부 포스트: `[텍스트]({% post_url 2026-04-28-hello-world %})`
- 같은 사이트 페이지: `[About]({{ '/about/' | relative_url }})`

## 5. SEO / 공유

- `excerpt`가 og:description으로 사용됨 → 사람이 읽기 좋게
- `header.og_image` 1200×630 권장. 없으면 사이트 기본 OG 이미지 사용
- 제목은 검색 결과에서 잘리지 않도록 60자 내외

## 6. 체크리스트 (발행 전)

- [ ] 파일명 `YYYY-MM-DD-slug.md` 형식
- [ ] front matter 필수 필드(title/date/categories/tags/excerpt) 모두 채움
- [ ] H1 미사용, H2부터 시작
- [ ] 모든 코드 블록에 언어 지정
- [ ] 모든 이미지에 alt
- [ ] 외부 링크 새 창 정책 일관 (마크다운은 기본 같은 탭 — 의도적 변경 시만 HTML)
- [ ] 로컬에서 `bundle exec jekyll serve` 또는 `docker compose up`으로 미리보기 OK
- [ ] 링크 깨짐·이미지 누락 없는지 확인
