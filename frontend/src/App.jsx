import React,{useEffect,useMemo,useState} from 'react';
import {LayoutDashboard,Users,Building2,GraduationCap,FolderKanban,Wallet,BookOpen,Milestone,Plus,Search,RefreshCw,Trash2,ChevronRight,Menu,X,ExternalLink,Activity} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const nav=[['Overview',LayoutDashboard],['Projects',FolderKanban],['Researchers',Users],['Departments',Building2],['Guides',GraduationCap],['Analytics',Activity]];
const empty={departments:{name:'',description:''},researchers:{name:'',email:'',designation:'',department_id:''},guides:{name:'',email:'',specialization:''},projects:{title:'',description:'',status:'Proposed',start_date:'',end_date:'',guide_id:''}};
const endpoints={Departments:'departments',Researchers:'researchers',Guides:'guides',Projects:'projects'};
const pretty=(v)=>v==null||v===''?'—':String(v);
function App(){
 const [page,setPage]=useState('Overview'),[stats,setStats]=useState(null),[data,setData]=useState({}),[loading,setLoading]=useState(false),[error,setError]=useState(''),[search,setSearch]=useState(''),[modal,setModal]=useState(false),[detail,setDetail]=useState(null),[toast,setToast]=useState('');
 const [form,setForm]=useState({});
 const [analytics,setAnalytics]=useState({overview:[],departments:[],funding:[],aggregates:null});
 const [detailData,setDetailData]=useState({researchers:[],funding:[],publications:[],milestones:[]});
 const [subForm,setSubForm]=useState({});
 const [subType,setSubType]=useState('funding');
 async function request(path,opts={}){
  const r=await fetch(`${API}${path}`,{...opts,headers:{'Content-Type':'application/json',...(opts.headers||{})}});
  if(!r.ok){let msg=`Request failed (${r.status})`;try{const j=await r.json();msg=j.detail||msg}catch{}throw Error(msg)}
  if(r.status===204)return null; return r.json();
 }
 async function load(){
  setLoading(true);setError('');
  try{
   const [s,...rest]=await Promise.all([request('/dashboard'),...Object.values(endpoints).map(x=>request('/'+x))]);
   setStats(s);setData(Object.fromEntries(Object.keys(endpoints).map((k,i)=>[k,rest[i]])));
  }catch(e){setError(e.message)}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(page==='Analytics'){Promise.all([
  request('/analytics/project-overview'),request('/analytics/departments'),
  request('/analytics/funding'),request('/analytics/aggregates')
 ]).then(([overview,departments,funding,aggregates])=>setAnalytics({overview,departments,funding,aggregates}))
 .catch(e=>setToast(e.message));}},[page]);

 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(t)}},[toast]);
 async function openProject(p){
  setDetail(p);
  try{
   const [researchers,funding,publications,milestones]=await Promise.all([
    request(`/projects/${p.id}/researchers`),request(`/projects/${p.id}/funding`),request(`/projects/${p.id}/publications`),request(`/projects/${p.id}/milestones`)]);
   setDetailData({researchers,funding,publications,milestones});
  }catch(e){setToast(e.message)}
 }
 function startCreate(){
  const key=page.toLowerCase();setForm({...empty[key]});setModal(true);
 }
 async function saveEntity(e){
  e.preventDefault();
  try{
   const path=endpoints[page.toLowerCase().replace(/s$/,'')+'s'] || endpoints[page];
   const key=page.toLowerCase();
   const body={...form};
   ['department_id','guide_id'].forEach(k=>{if(body[k]==='')body[k]=null;else if(body[k]!=null)body[k]=Number(body[k])});
   await request('/'+path,{method:'POST',body:JSON.stringify(body)});
   setModal(false);setToast(`${page.slice(0,-1)} created successfully`);await load();
  }catch(e){setToast(e.message)}
 }
 async function removeEntity(type,id){
  if(!confirm('Delete this record? This action cannot be undone.'))return;
  try{await request(`/${type.toLowerCase()}/${id}`,{method:'DELETE'});setToast('Record deleted');await load()}catch(e){setToast(e.message)}
 }
 async function addSub(e){
  e.preventDefault();
  try{
   let body={...subForm};
   if(subType==='funding')body.amount=Number(body.amount);
   if(['received_on','published_on','due_date'].includes(Object.keys(body).find(k=>k.endsWith('_on')||k==='due_date'))){}
   await request(`/projects/${detail.id}/${subType}`,{method:'POST',body:JSON.stringify(body)});
   setSubForm({});await openProject(detail);setToast('Project record added');
  }catch(e){setToast(e.message)}
 }
 const rows=useMemo(()=>{const list=data[page]||[];return list.filter(x=>JSON.stringify(x).toLowerCase().includes(search.toLowerCase()))},[data,page,search]);
 const projectCount=stats?.projects_total??0;
 return <div className="app-shell">
  <aside className="sidebar">
   <div className="brand"><div className="brand-icon"><Activity size={21}/></div><div><b>ResearchHub</b><small>MANAGEMENT PORTAL</small></div></div>
   <div className="nav-label">WORKSPACE</div>
   {nav.map(([name,Icon])=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>{setPage(name);setSearch('')}}><Icon size={18}/><span>{name}</span>{page===name&&<ChevronRight size={15} className="nav-arrow"/>}</button>)}
   <div className="sidebar-bottom"><div className="avatar">RP</div><div><b>Research Admin</b><small>Administrator</small></div><span className="online"/></div>
  </aside>
  <main className="main">
   <header className="topbar"><div className="crumb">Workspace <ChevronRight size={14}/> <b>{page}</b></div><div className="top-actions"><span className="live-dot"/> System online <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={17}/></button></div></header>
   <section className="content">
    {page==='Overview'?<><div className="page-heading"><div><div className="eyebrow">RESEARCH OPERATIONS</div><h1>Good morning, Admin <span>✦</span></h1><p>Here's what's happening across your research workspace.</p></div><button className="primary" onClick={()=>{setPage('Projects');setForm({...empty.projects});setModal(true)}}><Plus size={17}/> New project</button></div>
     {error&&<div className="error">{error}. Make sure the FastAPI backend is running.</div>}
     <div className="stats-grid">
      <Stat icon={FolderKanban} label="Total projects" value={stats?.projects_total} note="Across all statuses" color="purple"/>
      <Stat icon={Users} label="Researchers" value={stats?.researchers} note="Registered members" color="blue"/>
      <Stat icon={Building2} label="Departments" value={stats?.departments} note="Academic units" color="orange"/>
      <Stat icon={GraduationCap} label="Research guides" value={stats?.guides} note="Project supervisors" color="green"/>
     </div>
     <div className="overview-grid"><div className="panel"><div className="panel-head"><div><h3>Project portfolio</h3><p>Current project status distribution</p></div><button className="text-btn" onClick={()=>setPage('Projects')}>View all <ChevronRight size={15}/></button></div>
      {stats?.projects_total?Object.entries(stats.projects_by_status||{}).map(([k,v])=><div className="status-row" key={k}><div className="status-label"><span className={`status-dot ${k.toLowerCase()}`}/>{k}<b>{v}</b></div><div className="bar"><span style={{width:`${(v/projectCount)*100}%`}}/></div></div>):<Empty text="No projects yet. Create your first project to get started."/>}
     </div><div className="panel"><div className="panel-head"><div><h3>Research outputs</h3><p>Funding and publications overview</p></div></div><div className="metric-line"><div className="metric-icon mint"><Wallet size={18}/></div><div><small>Total funding</small><b>₹{Number(stats?.funding_total||0).toLocaleString('en-IN')}</b></div></div><div className="metric-line"><div className="metric-icon peach"><BookOpen size={18}/></div><div><small>Publications</small><b>{stats?.publications??'—'}</b></div></div><div className="metric-line"><div className="metric-icon lilac"><Milestone size={18}/></div><div><small>Milestones tracked</small><b>{stats?.milestones??'—'}</b></div></div></div></div>
     <div className="panel recent"><div className="panel-head"><div><h3>Recent projects</h3><p>Your latest research initiatives</p></div><button className="text-btn" onClick={()=>setPage('Projects')}>All projects <ChevronRight size={15}/></button></div><ProjectTable items={(data.Projects||[]).slice(0,5)} guides={data.Guides||[]} onOpen={openProject}/></div>
    </>:page==='Analytics'?<><div className="page-heading compact"><div><div className="eyebrow">DATABASE / SQL ANALYTICS</div><h1>Analytics</h1><p>Live reports powered by SQL views and aggregate functions.</p></div><button className="primary" onClick={()=>setPage('Overview')}><ChevronRight size={17}/> Back to overview</button></div>
     {analytics.aggregates&&<div className="stats-grid">
      <Stat icon={Users} label="Researchers" value={analytics.aggregates.totals.researchers} note="COUNT()"/>
      <Stat icon={FolderKanban} label="Projects" value={analytics.aggregates.totals.projects} note="COUNT()"/>
      <Stat icon={Wallet} label="Total funding" value={'₹'+Number(analytics.aggregates.totals.total_funding).toLocaleString('en-IN')} note="SUM()"/>
      <Stat icon={BookOpen} label="Average funding" value={'₹'+Number(analytics.aggregates.totals.average_funding).toLocaleString('en-IN',{maximumFractionDigits:0})} note="AVG()"/>
     </div>}
     <div className="overview-grid">
      <div className="panel"><div className="panel-head"><div><h3>Department statistics</h3><p>SQL view: vw_department_statistics</p></div></div>
       <div className="table-wrap"><table><thead><tr><th>DEPARTMENT</th><th>RESEARCHERS</th></tr></thead><tbody>{analytics.departments.map(d=><tr key={d.department_id}><td>{d.department_name}</td><td>{d.researcher_count}</td></tr>)}{!analytics.departments.length&&<tr><td colSpan="2"><Empty text="No department data."/></td></tr>}</tbody></table></div>
      </div>
      <div className="panel"><div className="panel-head"><div><h3>Projects by status</h3><p>COUNT() with GROUP BY</p></div></div>
       {(analytics.aggregates?.projects_by_status||[]).map(x=><div className="status-row" key={x.status}><div className="status-label">{x.status}<b>{x.project_count}</b></div></div>)}
       {!analytics.aggregates?.projects_by_status?.length&&<Empty text="No project data."/>}
      </div>
     </div>
     <div className="panel recent"><div className="panel-head"><div><h3>Project overview</h3><p>SQL view: vw_project_overview</p></div></div>
      <div className="table-wrap"><table><thead><tr><th>PROJECT</th><th>STATUS</th><th>RESEARCHERS</th><th>FUNDING</th><th>PUBLICATIONS</th><th>MILESTONES</th></tr></thead><tbody>{analytics.overview.map(p=><tr key={p.project_id}><td>{p.title}</td><td><Pill value={p.status}/></td><td>{p.researcher_count}</td><td>₹{Number(p.total_funding).toLocaleString('en-IN')}</td><td>{p.publication_count}</td><td>{p.milestone_count}</td></tr>)}{!analytics.overview.length&&<tr><td colSpan="6"><Empty text="No project data."/></td></tr>}</tbody></table></div>
     </div>
     <div className="panel recent"><div className="panel-head"><div><h3>Funding analysis</h3><p>SQL view: vw_project_funding_summary · SUM, AVG, MIN, MAX</p></div></div>
      <div className="table-wrap"><table><thead><tr><th>PROJECT</th><th>RECORDS</th><th>TOTAL</th><th>AVERAGE</th><th>MINIMUM</th><th>MAXIMUM</th></tr></thead><tbody>{analytics.funding.map(f=><tr key={f.project_id}><td>{f.title}</td><td>{f.funding_records}</td><td>₹{Number(f.total_funding).toLocaleString('en-IN')}</td><td>₹{Number(f.average_funding).toLocaleString('en-IN',{maximumFractionDigits:0})}</td><td>₹{Number(f.minimum_funding).toLocaleString('en-IN')}</td><td>₹{Number(f.maximum_funding).toLocaleString('en-IN')}</td></tr>)}{!analytics.funding.length&&<tr><td colSpan="6"><Empty text="No funding data."/></td></tr>}</tbody></table></div>
     </div>
    </>:<><div className="page-heading compact"><div><div className="eyebrow">WORKSPACE / {page.toUpperCase()}</div><h1>{page}</h1><p>Manage your {page.toLowerCase()} and keep research operations organised.</p></div><button className="primary" onClick={startCreate}><Plus size={17}/> Add {page.slice(0,-1).toLowerCase()}</button></div>
     {error&&<div className="error">{error}</div>}
     <div className="panel table-panel"><div className="table-toolbar"><div className="searchbox"><Search size={17}/><input placeholder={`Search ${page.toLowerCase()}...`} value={search} onChange={e=>setSearch(e.target.value)}/></div><span className="count">{rows.length} records</span></div>
      {loading?<div className="loading">Loading records…</div>:page==='Projects'?<ProjectTable items={rows} guides={data.Guides||[]} onOpen={openProject} onDelete={id=>removeEntity('projects',id)}/>:<GenericTable page={page} rows={rows} departments={data.Departments||[]} onDelete={id=>removeEntity(endpoints[page],id)}/>}
     </div></>}
   </section>
  </main>
  {modal&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={saveEntity}><div className="modal-head"><div><div className="eyebrow">NEW RECORD</div><h2>Add {page.slice(0,-1)}</h2></div><button type="button" className="icon-btn" onClick={()=>setModal(false)}><X size={19}/></button></div>
   {page==='Departments'?<><Field label="Department name" value={form.name} onChange={v=>setForm({...form,name:v})} required/><Field label="Description" value={form.description} onChange={v=>setForm({...form,description:v})}/></>:
   page==='Researchers'?<><Field label="Full name" value={form.name} onChange={v=>setForm({...form,name:v})} required/><Field label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} required/><Field label="Designation" value={form.designation} onChange={v=>setForm({...form,designation:v})}/><SelectField label="Department" value={form.department_id} onChange={v=>setForm({...form,department_id:v})} items={data.Departments||[]} /></>:
   page==='Guides'?<><Field label="Full name" value={form.name} onChange={v=>setForm({...form,name:v})} required/><Field label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} required/><Field label="Specialization" value={form.specialization} onChange={v=>setForm({...form,specialization:v})}/></>:
   <><Field label="Project title" value={form.title} onChange={v=>setForm({...form,title:v})} required/><Field label="Description" value={form.description} onChange={v=>setForm({...form,description:v})}/><SelectField label="Project guide" value={form.guide_id} onChange={v=>setForm({...form,guide_id:v})} items={data.Guides||[]}/><SelectField label="Status" value={form.status} onChange={v=>setForm({...form,status:v})} items={['Proposed','Ongoing','Completed','On Hold','Cancelled'].map(x=>({id:x,name:x}))}/><div className="field-row"><Field label="Start date" type="date" value={form.start_date} onChange={v=>setForm({...form,start_date:v})}/><Field label="End date" type="date" value={form.end_date} onChange={v=>setForm({...form,end_date:v})}/></div></>}
   <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(false)}>Cancel</button><button className="primary" type="submit">Create record</button></div></form></div>}
  {detail&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setDetail(null)}}><div className="detail-modal"><div className="modal-head"><div><div className="eyebrow">PROJECT DETAILS · #{detail.id}</div><h2>{detail.title}</h2><p>{detail.description||'No project description provided.'}</p></div><button className="icon-btn" onClick={()=>setDetail(null)}><X size={19}/></button></div><div className="detail-meta"><Pill value={detail.status}/><span>Guide: {(data.Guides||[]).find(g=>g.id===detail.guide_id)?.name||'Unassigned'}</span><span>{pretty(detail.start_date)} → {pretty(detail.end_date)}</span></div>
   <div className="detail-section"><h3>Project team</h3>{detailData.researchers.length?detailData.researchers.map(r=><div className="mini-row" key={r.researcher_id}><div className="mini-avatar">{r.name?.slice(0,1)}</div><span>{r.name}</span><small>{r.role||'Researcher'}</small></div>):<Empty text="No researchers assigned yet."/>}<form className="inline-form" onSubmit={async e=>{e.preventDefault();try{await request(`/projects/${detail.id}/researchers`,{method:'POST',body:JSON.stringify({researcher_id:Number(subForm.researcher_id),role:subForm.role||'Researcher'})});setSubForm({});await openProject(detail)}catch(err){setToast(err.message)}}}><select required value={subForm.researcher_id||''} onChange={e=>setSubForm({...subForm,researcher_id:e.target.value})}><option value="">Select researcher</option>{(data.Researchers||[]).map(r=><option value={r.id} key={r.id}>{r.name}</option>)}</select><input placeholder="Role" value={subForm.role||''} onChange={e=>setSubForm({...subForm,role:e.target.value})}/><button className="small-primary">Assign</button></form></div>
   <div className="detail-section"><div className="section-title"><h3>Project records</h3><select value={subType} onChange={e=>{setSubType(e.target.value);setSubForm({})}}><option value="funding">Funding</option><option value="publications">Publications</option><option value="milestones">Milestones</option></select></div>
   <form className="sub-form" onSubmit={addSub}>{subType==='funding'?<><Field label="Funding source" value={subForm.source||''} onChange={v=>setSubForm({...subForm,source:v})} required/><Field label="Amount (₹)" type="number" value={subForm.amount||''} onChange={v=>setSubForm({...subForm,amount:v})} required/><Field label="Received on" type="date" value={subForm.received_on||''} onChange={v=>setSubForm({...subForm,received_on:v})}/></>:subType==='publications'?<><Field label="Publication title" value={subForm.title||''} onChange={v=>setSubForm({...subForm,title:v})} required/><Field label="Journal" value={subForm.journal||''} onChange={v=>setSubForm({...subForm,journal:v})}/><Field label="DOI" value={subForm.doi||''} onChange={v=>setSubForm({...subForm,doi:v})}/><Field label="Published on" type="date" value={subForm.published_on||''} onChange={v=>setSubForm({...subForm,published_on:v})}/></>:<><Field label="Milestone title" value={subForm.title||''} onChange={v=>setSubForm({...subForm,title:v})} required/><Field label="Due date" type="date" value={subForm.due_date||''} onChange={v=>setSubForm({...subForm,due_date:v})}/><SelectField label="Status" value={subForm.status||'Pending'} onChange={v=>setSubForm({...subForm,status:v})} items={['Pending','In Progress','Completed','Delayed'].map(x=>({id:x,name:x}))}/></>}<button className="small-primary"><Plus size={14}/> Add</button></form>
   <div className="record-list">{(detailData[subType]||[]).length?(detailData[subType]||[]).map(x=><div className="record-row" key={x.id}><div><b>{x.title||x.source}</b><small>{x.journal||x.doi||x.received_on||x.due_date||''}</small></div><span>{subType==='funding'?`₹${Number(x.amount).toLocaleString('en-IN')}`:x.status||''}</span></div>):<Empty text={`No ${subType} records yet.`}/>}</div>
   </div></div></div>}
  {toast&&<div className="toast">{toast}</div>}
 </div>
}
function Stat({icon:Icon,label,value,note,color}){return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={20}/></div><div className="stat-copy"><span>{label}</span><b>{value??'—'}</b><small>{note}</small></div></div>}
function Field({label,value,onChange,type='text',required=false}){return <label className="field"><span>{label}{required?' *':''}</span><input type={type} value={value??''} required={required} onChange={e=>onChange(e.target.value)}/></label>}
function SelectField({label,value,onChange,items}){return <label className="field"><span>{label}</span><select value={value??''} onChange={e=>onChange(e.target.value)}><option value="">Select {label.toLowerCase()}</option>{items.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}
function Pill({value}){return <span className={`pill ${String(value).toLowerCase().replaceAll(' ','-')}`}>{value}</span>}
function Empty({text}){return <div className="empty">{text}</div>}
function ProjectTable({items,guides,onOpen,onDelete}){return <div className="table-wrap"><table><thead><tr><th>PROJECT</th><th>GUIDE</th><th>STATUS</th><th>TIMELINE</th><th></th></tr></thead><tbody>{items.length?items.map(p=><tr key={p.id}><td><button className="project-link" onClick={()=>onOpen(p)}>{p.title}</button><small className="subline">PRJ-{String(p.id).padStart(4,'0')}</small></td><td>{guides.find(g=>g.id===p.guide_id)?.name||'Unassigned'}</td><td><Pill value={p.status}/></td><td>{pretty(p.start_date)} – {pretty(p.end_date)}</td><td className="actions"><button className="icon-btn" onClick={()=>onOpen(p)} title="View details"><ExternalLink size={16}/></button>{onDelete&&<button className="icon-btn danger" onClick={()=>onDelete(p.id)} title="Delete"><Trash2 size={16}/></button>}</td></tr>):<tr><td colSpan="5"><Empty text="No projects found. Create your first project."/></td></tr>}</tbody></table></div>}
function GenericTable({page,rows,departments,onDelete}){let cols=page==='Researchers'?['name','email','designation','department_id']:page==='Departments'?['name','description']:['name','email','specialization'];const labels={name:'NAME',email:'EMAIL',designation:'DESIGNATION',department_id:'DEPARTMENT',description:'DESCRIPTION',specialization:'SPECIALIZATION'};return <div className="table-wrap"><table><thead><tr>{cols.map(c=><th key={c}>{labels[c]}</th>)}<th></th></tr></thead><tbody>{rows.length?rows.map(r=><tr key={r.id}>{cols.map(c=><td key={c}>{c==='department_id'?departments.find(d=>d.id===r[c])?.name||'—':pretty(r[c])}</td>)}<td className="actions"><button className="icon-btn danger" onClick={()=>onDelete(r.id)}><Trash2 size={16}/></button></td></tr>):<tr><td colSpan={cols.length+1}><Empty text={`No ${page.toLowerCase()} found. Add your first record.`}/></td></tr>}</tbody></table></div>}
export default App;