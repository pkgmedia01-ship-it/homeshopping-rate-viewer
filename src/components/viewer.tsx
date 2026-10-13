'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Release } from '@/lib/schema/rates';
import { isApprovedVideoUrl } from '@/lib/security/video-url';
import { shoppingNtBoundary, shoppingNtDays, shoppingNtZone } from '@/lib/domain/shoppingnt';
import { filterAndSortAirings, type ViewDay, type ViewOrder } from '@/lib/domain/view-sort';
import { normalizeVideoRegion } from '@/lib/domain/video-region';

const tabs = [
  { id: '전체', label: '전체' },
  { id: 'ShoppingNT', label: '쇼핑엔티' },
  { id: 'KT', label: 'KT알파쇼핑' },
  { id: 'CJ', label: 'CJ온스타일' },
  { id: '영상', label: '영상 리스트' }
] as const;
type Tab = (typeof tabs)[number]['id'];
const koDay: Record<string, string> = { Mon: '월', Tue: '화', Wed: '수', Thu: '목', Fri: '금', Sat: '토', Sun: '일' };
const money = (value: number | null | undefined) => value == null ? '—' : `${value.toLocaleString('ko-KR')}만원`;
const defaultOrder: ViewOrder = 'weekday-time-asc';

export default function Viewer({ release }: { release: Release }) {
  const [tab, setTab] = useState<Tab>('전체');

  const [day, setDay] = useState<ViewDay>('all');
  const order = defaultOrder;
  const rows = useMemo(() => tab === '영상' ? [] : filterAndSortAirings(release.airings, { channel: tab === '전체' ? 'all' : tab, day, order }), [release, tab, day, order]);
  const approvedVideos = release.videos.filter((video) => video.approved && isApprovedVideoUrl(video.url));


  return <main>
    <header className="top">
      <div className="hero-copy">
        <div className="brand-lockup" aria-label="어딩과 패키지">
          <span className="logo-tile eoding"><Image src="/brand/eoding-logo.png" alt="어딩" fill sizes="200px" style={{ objectFit: 'contain' }} priority/></span>
          <span className="brand-divider" aria-hidden="true"/>
          <span className="logo-tile package"><Image src="/brand/package-logo.png" alt="(주)패키지" fill sizes="68px" style={{ objectFit: 'contain' }} priority/></span>
        </div>
        <p className="eyebrow">HOMESHOPPING RATE GUIDE</p>
        <h1>홈쇼핑 요금 뷰어</h1>
        <p className="hero-meta"><strong>{release.month.replace('-', '년 ')}월</strong><span/>수수료 단위: {release.unit}</p>
      </div>
      <div className="header-summary"><span>10월 요금표</span><strong>쇼핑엔티 · KT알파쇼핑 · CJ온스타일</strong></div>
    </header>

    {tab !== '영상' && <div className="sort-bar" aria-label="요금표 정렬 및 필터">
      <div className="sort-title"><span>FILTER</span><strong>원하는 편성만 빠르게 보기</strong></div>
      <label>홈쇼핑사<select aria-label="홈쇼핑사" value={tab === '전체' ? 'all' : tab} onChange={(event) => setTab(event.target.value === 'all' ? '전체' : event.target.value as Exclude<Tab, '전체' | '영상'>)}><option value="all">전체 홈쇼핑사</option><option value="ShoppingNT">쇼핑엔티</option><option value="KT">KT알파쇼핑</option><option value="CJ">CJ온스타일</option></select></label>
      <label>요일<select aria-label="요일 기준" value={day} onChange={(event) => setDay(event.target.value as ViewDay)}><option value="all">전체 요일</option><option value="Mon">월요일</option><option value="Tue">화요일</option><option value="Wed">수요일</option><option value="Thu">목요일</option><option value="Fri">금요일</option><option value="Sat">토요일</option><option value="Sun">일요일</option></select></label>
      <p>홈쇼핑사를 선택하지 않으면 선택한 요일의 모든 홈쇼핑사를 함께 보여드립니다.</p>
    </div>}

    <nav role="tablist" aria-label="채널"><div className="tabs">{tabs.map(({ id, label }) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div></nav>

    {tab === '전체' && <AllChannels release={release} day={day} order={order}/>}
    {tab === 'ShoppingNT' && <ShoppingNtView release={release} day={day} order={order}/>} 
    {tab === 'KT' && <KtView release={release} day={day} order={order}/>}
    {tab === 'CJ' && <CJ release={release} rows={rows}/>} 
    {tab === '영상' && <VideoLibrary videos={approvedVideos}/>} 

    <footer><strong>홈쇼핑 방송 요금 안내</strong><span>편성 확정과 상세 조건은 담당자에게 확인해 주세요.</span></footer>
  </main>;
}

function VideoLibrary({ videos }: { videos: Release['videos'] }) {
  const [country, setCountry] = useState('전체');
  const [region, setRegion] = useState('전체');
  const normalizedVideos = useMemo(() => videos.map((video) => ({ ...video, region: normalizeVideoRegion(video.country, video.region) })), [videos]);
  const countries = ['전체', ...new Set(normalizedVideos.map((video) => video.country))];
  const countryVideos = country === '전체' ? normalizedVideos : normalizedVideos.filter((video) => video.country === country);
  const regions = ['전체', ...new Set(countryVideos.map((video) => video.region))];
  const filtered = countryVideos.filter((video) => region === '전체' || video.region === region);
  const visibleCountries = [...new Set(filtered.map((video) => video.country))];
  const duration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return <section aria-labelledby="video-title" className="video-library"><div className="section-title"><div><p className="eyebrow">PACKAGE MEDIA</p><h2 id="video-title">여행 영상 리스트</h2><p className="section-subtitle">나라와 지역을 선택해 영상을 찾아보세요.</p></div><b>{filtered.length}개 영상</b></div>
    <div className="video-filters"><label>국가<select aria-label="영상 국가" value={country} onChange={(event) => { setCountry(event.target.value); setRegion('전체'); }}>{countries.map((item) => <option key={item}>{item}</option>)}</select></label><label>지역<select aria-label="영상 지역" value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {filtered.length === 0 ? <p className="empty-state">선택한 조건의 영상이 없습니다.</p> : <div className="video-groups">{visibleCountries.map((visibleCountry) => <div className="country-group" key={visibleCountry}><div className="country-heading"><h3>{visibleCountry}</h3><span>{filtered.filter((video) => video.country === visibleCountry).length}개</span></div>{[...new Set(filtered.filter((video) => video.country === visibleCountry).map((video) => video.region))].map((visibleRegion) => <div className="region-group" key={visibleRegion}><h4>{visibleRegion}</h4><div className="video-grid">{filtered.filter((video) => video.country === visibleCountry && video.region === visibleRegion).map((video) => <article className="video-card" key={video.id}><div className="video-card-top"><span>{duration(video.durationSeconds)}</span></div><h5>{video.title}</h5><p>{video.country} · {video.region}</p><a href={video.url} target="_blank" rel="noopener noreferrer">YouTube에서 보기 <span aria-hidden="true">↗</span></a></article>)}</div></div>)}</div>)}</div>}
  </section>;
}

function ShoppingNtView({ release, day, order }: { release: Release; day: ViewDay; order: ViewOrder }) {
  return <section aria-labelledby="snt-title"><div className="section-title"><div><p className="eyebrow">24 HOURS × 7 DAYS</p><h2 id="snt-title">쇼핑엔티 요금표</h2><p className="section-subtitle">시간대와 요일을 한눈에 비교하세요. 단위: 만원</p></div></div><ShoppingNtTable release={release} day={day} order={order}/><div className="rule-grid"><article className="rule-card priority"><span className="rule-mark red-line"/><div><strong>빨간선 바깥 시간 편성 시 3회 편성 必</strong><p>빨간 테두리 밖의 시간대는 1회 녹화 시 3회 편성 조건입니다.</p></div></article><article className="rule-card"><span className="rule-mark inside"/><div><strong>빨간선 안쪽: 2회 이상 편성</strong><p>1회 녹화 시 2회 이상 편성이 필요합니다.</p></div></article><article className="rule-card"><span className="rule-number">+500</span><div><strong>1회만 편성할 경우</strong><p>해당 시간 방송비에 500만원 추가되며 추가 금액은 VAT 별도입니다.</p></div></article><article className="rule-card"><span className="rule-mark holiday">일</span><div><strong>공휴일은 일요일 요금 적용</strong><p>기본 요금의 VAT 여부는 별도 표기가 없습니다.</p></div></article></div><aside className="notice"><strong>시작시간 기준</strong> · 방송 시작·종료 분은 변동될 수 있으며, 상세 편성 조건은 담당자 확인이 필요합니다.</aside></section>;
}

function KtView({ release, day, order }: { release: Release; day: ViewDay; order: ViewOrder }) {
  return <section aria-labelledby="kt-title"><div className="section-title"><div><p className="eyebrow">KT ALPHA SHOPPING</p><h2 id="kt-title">KT알파쇼핑 요금표</h2><p className="section-subtitle">표에 안내된 시간대를 표시합니다. 단위: 만원</p></div></div><KtTable release={release} day={day} order={order}/><div className="info-strip"><strong>기준 요금표</strong><span>내부 가중치에 따라 실제 청구 요금은 달라질 수 있습니다.</span><span>1회 녹화 시 1회 편성</span><span>공휴일은 일요일 요금 적용</span></div><aside className="notice"><strong>시작시간 기준</strong> · 방송 시작·종료 분은 변동될 수 있습니다.</aside></section>;
}

function AllChannels({ release, day, order }: { release: Release; day: ViewDay; order: ViewOrder }) {
  const shoppingNtRows = filterAndSortAirings(release.airings, { channel: 'ShoppingNT', day, order });
  const ktRows = filterAndSortAirings(release.airings, { channel: 'KT', day, order });
  const cjRows = filterAndSortAirings(release.airings, { channel: 'CJ', day, order });
  const selectedDay = day === 'all' ? '전체 요일' : `${koDay[day]}요일`;
  return <section aria-labelledby="all-title" className="all-channels"><div className="section-title"><div><p className="eyebrow">{selectedDay}</p><h2 id="all-title">전체 홈쇼핑사</h2><p className="section-subtitle">같은 요일의 요금을 홈쇼핑사별로 이어서 확인하세요.</p></div></div>
    <article className="company-panel" data-company-panel="ShoppingNT"><div className="company-panel-title"><h3>쇼핑엔티</h3></div>{shoppingNtRows.length ? <ShoppingNtTable release={release} day={day} order={order}/> : <p className="empty-state">해당 요일 편성 없음</p>}</article>
    <article className="company-panel" data-company-panel="KT"><div className="company-panel-title"><h3>KT알파쇼핑</h3></div>{ktRows.length ? <KtTable release={release} day={day} order={order}/> : <p className="empty-state">해당 요일 편성 없음</p>}</article>
    <article className="company-panel" data-company-panel="CJ"><div className="company-panel-title"><h3>CJ온스타일</h3></div>{cjRows.length ? <CJ release={release} rows={cjRows}/> : <p className="empty-state">해당 요일 편성 없음</p>}</article>
  </section>;
}

function ShoppingNtTable({ release, day, order }: { release: Release; day: ViewDay; order: ViewOrder }) {
  const offerById = new Map(release.offers.filter((offer) => offer.channel === 'ShoppingNT').map((offer) => [offer.id, offer]));
  const visibleDays = day === 'all' ? [...shoppingNtDays] : [day];
  if (order === 'weekday-time-desc') visibleDays.reverse();
  const visibleHours = Array.from({ length: 24 }, (_, hour) => hour);
  if (order === 'weekday-time-desc') visibleHours.reverse();
  return <><p className="table-hint" aria-hidden="true">↔ 좌우로 밀어서 요일별 요금을 확인하세요.</p><div className="rate-table-wrap" role="region" aria-label="쇼핑엔티 요금표 스크롤 영역" tabIndex={0}><table className="rate-table" aria-label="쇼핑엔티 시간대별 방송 요금"><thead><tr><th scope="col">시간</th>{visibleDays.map((visibleDay) => <th scope="col" key={visibleDay}>{koDay[visibleDay]}</th>)}</tr></thead><tbody>{visibleHours.map((hour) => { const hourText = String(hour).padStart(2, '0'); return <tr key={hourText}><th scope="row">{hourText}</th>{visibleDays.map((visibleDay) => { const zone = shoppingNtZone(visibleDay, hour); const edge = shoppingNtBoundary(visibleDay, hour); const offer = offerById.get(`snt-${visibleDay.toLowerCase()}-${hourText}`); const className = [zone === 'inside_box' ? 'rate-inside' : 'rate-outside', edge.top && 'zone-top', edge.right && 'zone-right', edge.bottom && 'zone-bottom', edge.left && 'zone-left'].filter(Boolean).join(' '); return <td key={visibleDay} data-day={visibleDay} data-hour={hourText} data-zone={zone} className={className}><strong>{offer?.priceManwon.toLocaleString('ko-KR')}</strong><span className="sr-only">만원 · {zone === 'inside_box' ? '빨간선 안쪽' : '빨간선 바깥'}</span></td>; })}</tr>; })}</tbody></table></div></>;
}

function KtTable({ release, day, order }: { release: Release; day: ViewDay; order: ViewOrder }) {
  const offerById = new Map(release.offers.filter((offer) => offer.channel === 'KT').map((offer) => [offer.id, offer]));
  const visibleDays = day === 'all' ? [...shoppingNtDays] : [day];
  const visibleHours = [0, 17, 18, 19, 20, 21, 22, 23];
  if (order === 'weekday-time-desc') { visibleDays.reverse(); visibleHours.reverse(); }
  return <><p className="table-hint" aria-hidden="true">↔ 좌우로 밀어서 요일별 요금을 확인하세요.</p><div className="rate-table-wrap kt-table-wrap" role="region" aria-label="KT알파쇼핑 요금표 스크롤 영역" tabIndex={0}><table className="rate-table kt-table" aria-label="KT알파쇼핑 시간대별 방송 요금"><thead><tr><th scope="col">시간</th>{visibleDays.map((visibleDay) => <th scope="col" key={visibleDay}>{koDay[visibleDay]}</th>)}</tr></thead><tbody>{visibleHours.map((hour) => { const hourText = String(hour).padStart(2, '0'); return <tr key={hourText}><th scope="row">{hourText}</th>{visibleDays.map((visibleDay) => <td key={visibleDay} data-day={visibleDay} data-hour={hourText}><strong>{offerById.get(`kt-offer-${visibleDay.toLowerCase()}-${hourText}`)?.priceManwon.toLocaleString('ko-KR')}</strong></td>)}</tr>; })}</tbody></table></div></>;
}

function CJ({ release, rows }: { release: Release; rows: Release['airings'] }) {
  const offerById = new Map(release.offers.map((offer) => [offer.id, offer]));
  const liveRows = rows.filter((row) => row.kind === 'live');
  const sets = release.offers.filter((offer) => offer.channel === 'CJ' && offer.priceBasis === 'set_fee' && rows.some((row) => row.offerId === offer.id));
  return <section aria-labelledby="cj-title"><div className="section-title"><div><p className="eyebrow">LIVE & T-COMMERCE</p><h2 id="cj-title">CJ온스타일 요금표</h2><p className="section-subtitle">LIVE 요금과 T커머스 세트 요금을 구분해 확인하세요. 단위: 만원</p></div></div><div className="cj-layout"><div><h3 className="group-title">TV LIVE</h3><div className="cards">{liveRows.map((airing) => { const offer = offerById.get(airing.offerId); return <article className="card live-card" key={airing.id}><span className="pill">{koDay[airing.day]}요일 · LIVE</span><h3>{airing.start}–{airing.end}</h3><strong>{money(offer?.priceManwon)}</strong><p>정액 수수료 · VAT 제외</p></article>; })}</div></div><aside><h3 className="group-title">T커머스 세트</h3>{sets.map((set) => { const components = rows.filter((row) => row.offerId === set.id); return <article className="set-card" key={set.id}><div className="set-card-head"><h3>{set.label.replace('T커머스 ', '')}</h3><strong>{money(set.priceManwon)}</strong></div><p>1회 녹화 · 2회 편성 기준 · VAT 제외</p><ul>{components.map((component) => <li key={component.id}><span>{koDay[component.day]}요일</span><strong>{component.start}–{component.end}{component.endDayOffset ? ' (다음 날)' : ''}</strong></li>)}</ul></article>; })}</aside></div><div className="notice">TV LIVE는 라이브 방송, T커머스는 녹화 방송입니다. 시작·종료 시간은 변동될 수 있습니다.</div></section>;
}
