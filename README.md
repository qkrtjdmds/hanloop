# HanaLoop 탄소 배출 대시보드

## 1. 프로젝트 소개
HanaLoop 탄소 배출 대시보드는 채용 과제를 위해 구현한 Next.js 기반 프론트엔드 프로젝트입니다.

과제 엑셀 파일의 `과제용 데이터` 시트를 기준으로 활동 데이터와 배출계수를 시드 데이터로 구성했고, 이를 바탕으로 탄소 배출량을 시각화합니다.

배출량 계산 기준은 다음과 같습니다.

`활동 데이터 × 배출계수 = 배출량(kgCO₂e)`

현재 프로젝트는 과제 데이터셋 기준으로 아래 대상을 사용합니다.

- 기업: `HanaLoop CT-045`
- 국가: `대한민국`

## 2. 기술 스택
- Next.js 16 (App Router)
- React 19
- TypeScript
- Zustand
- Recharts
- Tailwind CSS 4
- ESLint

## 3. 주요 기능
### 실제 구현된 기능
- 월별 탄소 배출량 차트
- Scope별 배출 비중 차트
- 활동 유형별 배출량 집계
- 활동 데이터 입력
- 활동 데이터 삭제
- 입력값 validation
- 엑셀 과제 데이터 기반 seed data 구성
- 배출계수와 활동 데이터 분리 구조
- 활동 데이터 저장 후 KPI/차트 즉시 반영

### 현재 미구현 사항
- 활동 데이터 수정 UI

## 4. 엑셀 데이터 매핑
프로젝트 루트의 `2026년_개발자_채용과제.xlsx` 파일에서 `과제용 데이터` 시트를 읽어 시드 데이터로 반영했습니다.

컬럼 매핑은 다음과 같습니다.

- `일자` → `date`
- `활동 유형` → `activityType`
- `설명` → `description`
- `량` → `amount`
- `단위` → `unit`
- `배출계수` → `emissionFactor`

Scope는 시트에 직접 컬럼이 없어서 도메인 기준으로 매핑했습니다.

- `전기` → `Scope 2`
- `원소재` → `Scope 3`
- `운송` → `Scope 3`

화면 표시명은 한국어를 사용하고, 내부 식별자는 영문 id를 유지합니다.

- `electricity` → `전기`
- `materials` → `원소재`
- `transport` → `운송`

## 5. 데이터 구조
### `ActivityRecord`
탄소 활동 데이터 1건을 의미합니다.

- `id`
- `companyId`
- `countryCode`
- `date`
- `activityType`
- `description`
- `amount`
- `unit`
- `emissionFactor`
- `scope`

### `EmissionFactor`
활동 유형별 배출계수 정보입니다.

- `activityType`
- `label`
- `unit`
- `factor`
- `sourceLabel`

### `Company`
기업 정보입니다.

- `id`
- `name`
- `countryCode`
- `industry`
- `facilityName`

### `Country`
국가 정보입니다.

- `code`
- `name`
- `region`
- `currency`

### `Scope`
온실가스 배출 범위를 의미합니다.

- `Scope 1`: 기업이 직접 배출한 온실가스
- `Scope 2`: 구매한 전력 사용으로 발생한 간접 배출
- `Scope 3`: 원소재, 운송 등 공급망에서 발생한 기타 간접 배출

### 계산 방식
- 기본 계산 단위는 `kgCO₂e`
- 계산식은 `활동량 × 배출계수`
- 화면 표시값은 소수점 둘째 자리 기준으로 반올림합니다.

## 6. 실행 방법
프로젝트 루트에서 아래 명령을 실행합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드 검증은 아래 명령으로 수행합니다.

```bash
npm run build
```

기본 개발 서버 주소:

- `http://localhost:3000`

로컬 네트워크 접속이 필요하면 현재 설정 기준으로 로컬 IP에서도 접속할 수 있습니다.

## 7. AI 사용 내역
이번 과제 구현 과정에서 AI를 아래 범위에서 보조적으로 활용했습니다.

- 데이터 구조 설계 보조
- 엑셀 데이터 매핑 정리 보조
- 오류 원인 분석 보조
- README 초안 작성 보조

최종 코드는 직접 검토하고 수정했으며, 실제 구현 범위를 벗어나는 내용은 제외했습니다.

## 8. 향후 개선
- PostgreSQL 연동
- CSV/XLSX 업로드
- 배출계수 버전 관리
- 기업별 권한 관리
- 실제 인증/로그인

## 9. 프로젝트 구조
```text
src/
  app/
  components/
    activity/
    charts/
    dashboard/
    layout/
  data/
  lib/
  stores/
  types/
```

주요 파일:

- `src/data/seed.ts`: 과제용 엑셀 데이터 기반 시드 데이터
- `src/lib/carbon.ts`: 배출량 계산 및 집계 함수
- `src/lib/api.ts`: 지연/실패 시뮬레이션이 포함된 가짜 API 레이어
- `src/stores/carbonStore.ts`: Zustand 전역 상태
- `src/components/activity/*`: 활동 데이터 입력/목록 UI
- `src/components/charts/*`: 차트 UI

## 10. 검증
최종 기준으로 아래 명령으로 빌드를 확인했습니다.

```bash
npm run build
```

검증 결과:

- Next.js build 성공
- TypeScript 검사 통과
- `/` 및 `/activity` 라우트 생성 확인
