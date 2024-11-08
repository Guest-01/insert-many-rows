# insert-many-rows

> RDB(Postgres)에 실시간 로그성 데이터를 한번에 많이 넣으면 어떻게 될까?

## 실험 배경

회사에서 IDS 제품의 `suricata` 엔진에서 발생하는 탐지 로그를 `redis`를 통해 `opensearch`에 적재하고 있습니다.

굳이 `opensearch`까지 이용하는 것이 오버 엔지니어링이라고 생각해 그냥 RDB를 이용하면 안될까싶어 테스트한 내용입니다.

사내에서 `opensearch`를 도입하게 된 이유 중 하나로 탐지 로그가 초당 몇백, 몇천 건 단위로 발생하는데 일반 RDB를 쓰면 로그 발생 시각과 insert 시각이 점점 차이가 벌어진다고 합니다.

그러나 저는 그것이 미숙한 RDB 사용으로 인해 발생하는 증상이라고 생각합니다. 적절한 query와 transaction을 통해 bulk insert 등의 기법을 쓰면 RDB도 충분히 많은 양의 데이터를 실시간으로 적재할 수 있다고 믿고 있습니다.

따라서 실제로 많은 양의 JSON을 출력하는 더미 바이너리를 만들고 여기서 나오는 JSON을 RDB에 넣어보는 실험을 기획하였습니다.

## 설명

다량의 JSON을 출력하는 가상의 프로세스는 `dummysensor`라는 이름으로 `Go`를 이용해 만든 바이너리가 담당합니다.

여기서 나오는 `stdout`(JSON)을 파싱하고 DB에 적재하는 역할은 `nodejs`로 만든 `index.js` 스크립트가 담당합니다. 이 스크립트는 내부에서 `prisma`라는 ORM을 이용하여 `createMany` 함수를 통해 벌크 인서트를 수행합니다.

그리고 사용할 DB는 별도로 Docker를 이용해 로컬호스트에 띄워줍니다.

## v2

기존에는 `dummysensor` 바이너리를 NodeJS의 ChildProcess를 이용해 실행하고 그 결과를 파싱하는 방식으로 구현했습니다.

하지만 이렇게하면 NodeJS의 프로세스 추상화에 의존성이 생기고, 그로 인해 병목이 생길 수 있다고 봤습니다. (실제로 생기진 않았음)

그래서 `dummysensor` 바이너리를 터미널에서 직접 실행한 뒤 stdout을 pipe로 연결하는 방식으로 변경하였습니다.

또한 plain SQL과 ORM을 사용하는 방식을 비교하기 위해 추가로 `prisma`를 이용하지 않고 직접 SQL을 작성하는 방식도 추가하였습니다.

TODO: 단일 INSERT 문을 반복하는 것과 Bulk INSERT를 도입하는 것의 차이점 확인하기