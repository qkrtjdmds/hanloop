# HanaLoop 탄소 배출 대시보드

## 프로젝트 소개
HanaLoop 탄소 배출 대시보드는 채용 과제를 위해 구현한 Next.js 기반 프론트엔드 프로젝트입니다.

과제용 엑셀 데이터의 `과제용 데이터` 시트를 기준으로 활동 데이터와 배출계수를 구성했고, 이를 바탕으로 PCF 관점의 탄소 배출량을 시각화합니다.

탄소 계산 기준은 다음과 같습니다.

`배출량(kgCO₂e) = 활동량 × 배출계수`

현재 구현은 과제 데이터셋 기준으로 단일 기업 `HanaLoop CT-045`, 단일 국가 `대한민국`을 대상으로 동작합니다.

## 기술 스택
- Next.js 16 (App Router)
- TypeScript
- React 19
- Zustand
- Recharts
- Tailwind CSS 4
- ESLint

## 주요 기능
### 현재 구현된 기능
- 월별 탄소 배출량 차트
- Scope별 배출 비중 차트
- 활동 유형별 배출량 집계
- 활동 데이터 입력
- 입력값 validation
- 과제용 데이터 기반 seed data 사용
- 활동 데이터 저장/삭제 후 KPI와 차트 즉시 반영

### 현재 미구현 기능
- 활동 데이터 수정 UI
- 실제 데이터베이스 연동
- 파일 업로드 기반 데이터 등록

## 데이터 구조 설명
### `ActivityRecord`
활동 데이터 1건을 표현합니다.

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
활동 유형별 배출계수 정보를 표현합니다.

- `activityType`
- `label`
- `unit`
- `factor`
- `sourceLabel`

### `Scope`
배출 범위를 표현합니다.

- `Scope 1`: 기업이 직접 배출한 온실가스
- `Scope 2`: 구매한 전력 사용으로 발생한 간접 배출
- `Scope 3`: 원소재, 운송 등 공급망에서 발생한 기타 간접 배출

### `Company`
대상 기업 정보를 표현합니다.

- `id`
- `name`
- `countryCode`
- `industry`
- `facilityName`

### `Country`
국가 정보를 표현합니다.

- `code`
- `name`
- `region`
- `currency`

## 탄소 계산 방식
배출량 계산은 아래 공식을 사용합니다.

`배출량(kgCO₂e) = 활동량 × 배출계수`

화면 표시값은 소수점 둘째 자리까지 반올림합니다.

## 엑셀 데이터 매핑
프로젝트 루트의 `2026년_개발자_채용과제.xlsx` 파일에서 `과제용 데이터` 시트를 읽어 seed data로 반영했습니다.

매핑 기준은 다음과 같습니다.

- `일자` → `date`
- `활동 유형` → `activityType`
- `설명` → `description`
- `량` → `amount`
- `단위` → `unit`
- `배출계수` → `emissionFactor`
- `전기` → `Scope 2`
- `원소재/운송` → `Scope 3`

내부 id는 영문을 유지하고, UI에는 한국어 표시명을 사용합니다.

## 시스템 전체 설명
이 프로젝트는 Next.js App Router 기반의 단일 프론트엔드 애플리케이션입니다.

- `src/data/seed.ts`
  과제용 엑셀 데이터를 TypeScript 시드 데이터로 변환한 파일입니다.
- `src/lib/api.ts`
  지연 시간과 저장 실패를 흉내 내는 가짜 API 레이어입니다.
- `src/stores/carbonStore.ts`
  대시보드 데이터, 선택 상태, 저장/삭제 액션을 관리하는 Zustand 스토어입니다.
- `src/lib/carbon.ts`
  배출량 계산, 월별 집계, 활동 유형별 집계, Scope별 집계 함수를 제공합니다.
- `src/components/dashboard/*`
  KPI 카드와 대시보드 요약 화면을 구성합니다.
- `src/components/activity/*`
  활동 데이터 입력 폼과 목록 테이블을 구성합니다.

## 설계 의도
- 배출계수와 활동 데이터를 분리했습니다.
  활동 데이터는 실제 사용량 기록이고, 배출계수는 계산 기준값이므로 역할이 다릅니다. 구조를 분리하면 추후 배출계수 관리나 외부 데이터 연동이 쉬워집니다.
- Scope 기반 집계를 위해 구조를 분리했습니다.
  활동 데이터에 `scope`를 포함해 두면 대시보드에서 Scope 2, Scope 3 배출 비중을 바로 계산할 수 있습니다.

## Trade-off
- PostgreSQL 대신 seed data를 사용했습니다.
  과제 제출 범위에서는 구현 속도와 실행 재현성을 우선했고, 별도 백엔드 없이도 바로 실행 가능한 구조를 선택했습니다.

## 실행 방법
5단계 이내로 실행할 수 있습니다.

1. `npm install` 또는 `yarn`
2. `npm run build` 또는 `yarn build`
3. `npm start` 또는 `yarn start`
4. 브라우저에서 `http://localhost:3000` 접속

개발 모드가 필요하면 `npm run dev`를 사용할 수 있습니다.

## AI 사용 내역
이번 과제 구현 과정에서 AI를 아래 범위에서 보조적으로 활용했습니다.

- 데이터 구조 설계 보조
- 엑셀 데이터 매핑 보조
- 오류 원인 분석 보조
- README 초안 작성 보조

최종 코드는 직접 검토 및 수정했고, 실제 구현 범위를 벗어나는 내용은 제외했습니다.

## 향후 개선
- PostgreSQL 연동
- CSV/XLSX 업로드
- 배출계수 버전 관리
- 기업별 인증/권한 관리

## 검증
최종 기준으로 아래 항목을 확인했습니다.

- `npm run build`
- `npm start`
- `yarn build`
- `yarn start`

실행 환경에 Yarn이 없는 경우에는 Corepack 또는 Yarn 설치가 선행되어야 합니다.
