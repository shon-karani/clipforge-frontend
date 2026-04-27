import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DESIGN SYSTEM
// ============================================================
const DS = {
  colors: {
    bg: "#050508",
    surface: "#0d0d14",
    surfaceHigh: "#13131e",
    border: "rgba(255,255,255,0.06)",
    borderHover: "rgba(99,255,180,0.25)",
    accent: "#63ffb4",
    accentDim: "rgba(99,255,180,0.12)",
    accentGlow: "rgba(99,255,180,0.35)",
    red: "#ff4d6d",
    orange: "#ff9a3c",
    blue: "#4d9fff",
    purple: "#b06dff",
    yellow: "#ffe066",
    textPrimary: "#f0f0f8",
    textSecondary: "rgba(240,240,248,0.45)",
    textMuted: "rgba(240,240,248,0.22)",
  },
  fonts: {
    display: "'Bebas Neue', 'Impact', sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${DS.colors.bg};color:${DS.colors.textPrimary};font-family:${DS.fonts.body};}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(99,255,180,0.2);border-radius:99px;}
  ::selection{background:rgba(99,255,180,0.25);color:#fff;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(99,255,180,0.1)}50%{box-shadow:0 0 40px rgba(99,255,180,0.3)}}
  @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
  @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
  @keyframes waveBar{0%,100%{height:4px}50%{height:20px}}
  @keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
  @keyframes notifDrop{from{opacity:0;transform:translateY(-30px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes borderPulse{0%,100%{border-color:rgba(99,255,180,0.2)}50%{border-color:rgba(99,255,180,0.6)}}
  input,textarea,select{outline:none;font-family:${DS.fonts.body};}
  button{cursor:pointer;font-family:${DS.fonts.body};}
  a{text-decoration:none;color:inherit;}
`;

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_CLIPS = [
  {id:1,title:"The ONE Habit That Changed My Life",duration:"0:52",score:97,hookScore:95,retentionScore:92,platformScore:{TikTok:97,Reels:94,Shorts:89},views:"3.2M",platform:"TikTok",transcript:"I started doing this every single morning and within 30 days everything changed...",tags:["Hook","Story","Transformation"],color:"#63ffb4",viral:true,thumbnail:"linear-gradient(135deg,#0a2a1a,#063316)",bestTime:"7:00 PM",bestDay:"Tuesday"},
  {id:2,title:"Nobody Talks About This Strategy",duration:"1:04",score:94,hookScore:98,retentionScore:88,platformScore:{TikTok:91,Reels:94,Shorts:86},views:"1.8M",platform:"Reels",transcript:"Every successful entrepreneur knows this secret but they never share it publicly...",tags:["Curiosity","Business","Value"],color:"#4d9fff",viral:true,thumbnail:"linear-gradient(135deg,#0a1a2a,#061633)",bestTime:"12:00 PM",bestDay:"Wednesday"},
  {id:3,title:"I Was Completely Wrong About This",duration:"0:47",score:91,hookScore:89,retentionScore:94,platformScore:{TikTok:88,Reels:85,Shorts:91},views:"945K",platform:"Shorts",transcript:"For years I believed this was the right approach. I was completely wrong and here's why...",tags:["Vulnerability","Surprise","Education"],color:"#b06dff",viral:false,thumbnail:"linear-gradient(135deg,#1a0a2a,#160633)",bestTime:"3:00 PM",bestDay:"Thursday"},
  {id:4,title:"From Broke to $50K in 6 Months",duration:"1:18",score:88,hookScore:91,retentionScore:85,platformScore:{TikTok:86,Reels:88,Shorts:84},views:"678K",platform:"TikTok",transcript:"Six months ago I had $200 in my bank account. Here's exactly what I did...",tags:["Results","Story","Money"],color:"#ff9a3c",viral:false,thumbnail:"linear-gradient(135deg,#2a1a0a,#331606)",bestTime:"6:00 PM",bestDay:"Friday"},
  {id:5,title:"Stop Doing This Immediately",duration:"0:39",score:85,hookScore:93,retentionScore:81,platformScore:{TikTok:85,Reels:82,Shorts:87},views:"423K",platform:"Shorts",transcript:"If you're still doing this in 2024 you are literally leaving money on the table...",tags:["Warning","Urgency","Tips"],color:"#ff4d6d",viral:false,thumbnail:"linear-gradient(135deg,#2a0a0f,#33060d)",bestTime:"9:00 AM",bestDay:"Monday"},
];

const PLATFORMS = [
  {id:"tiktok",name:"TikTok",icon:"🎵",color:"#ff0050",followers:"0",connected:false},
  {id:"instagram",name:"Instagram",icon:"📸",color:"#e1306c",followers:"0",connected:false},
  {id:"youtube",name:"YouTube Shorts",icon:"▶️",color:"#ff0000",followers:"0",connected:false},
  {id:"twitter",name:"X / Twitter",icon:"𝕏",color:"#1da1f2",followers:"0",connected:false},
  {id:"linkedin",name:"LinkedIn",icon:"💼",color:"#0077b5",followers:"0",connected:false},
  {id:"facebook",name:"Facebook",icon:"👥",color:"#1877f2",followers:"0",connected:false},
];

const SCHEDULED_POSTS = [
  {id:1,clip:"The ONE Habit That Changed My Life",platform:"TikTok",time:"7:00 PM",day:"Today",status:"scheduled",score:97},
  {id:2,clip:"Nobody Talks About This Strategy",platform:"Instagram",time:"12:00 PM",day:"Tomorrow",status:"scheduled",score:94},
  {id:3,clip:"I Was Completely Wrong About This",platform:"YouTube",time:"3:00 PM",day:"Thursday",status:"draft",score:91},
];

const GROWTH_TIPS = [
  {platform:"TikTok",tip:"Your hook in the first 2 seconds is weak. Add pattern interrupt — start mid-sentence.",priority:"HIGH",impact:"+43% retention"},
  {platform:"Instagram",tip:"You're posting at 2pm. Your audience is most active at 7pm. Switch posting time.",priority:"HIGH",impact:"+67% reach"},
  {platform:"YouTube",tip:"Your thumbnails lack contrast. Add bright text overlay on dark background.",priority:"MEDIUM",impact:"+31% CTR"},
  {platform:"All",tip:"Post 3x per day for first 30 days. Consistency triggers algorithm favor.",priority:"HIGH",impact:"+200% growth speed"},
];

// ============================================================
// COMPONENTS
// ============================================================

function Btn({children, variant="primary", onClick, style={}, size="md", icon}){
  const sizes = {sm:"8px 14px", md:"11px 22px", lg:"14px 32px"};
  const fonts = {sm:"11px", md:"13px", lg:"15px"};
  const base = {
    border:"none", borderRadius:10, fontWeight:700, cursor:"pointer",
    display:"inline-flex", alignItems:"center", gap:7,
    padding:sizes[size], fontSize:fonts[size], transition:"all 0.2s ease",
    letterSpacing:0.3,
  };
  const variants = {
    primary:{background:`linear-gradient(135deg,${DS.colors.accent},#00d4ff)`,color:"#000"},
    ghost:{background:"transparent",border:`1px solid ${DS.colors.border}`,color:DS.colors.textSecondary},
    danger:{background:"rgba(255,77,109,0.12)",border:"1px solid rgba(255,77,109,0.25)",color:DS.colors.red},
    accent:{background:DS.colors.accentDim,border:`1px solid rgba(99,255,180,0.2)`,color:DS.colors.accent},
    dark:{background:DS.colors.surfaceHigh,border:`1px solid ${DS.colors.border}`,color:DS.colors.textPrimary},
  };
  return(
    <button onClick={onClick} style={{...base,...variants[variant],...style}}
      onMouseEnter={e=>{if(variant==="primary"){e.currentTarget.style.filter="brightness(1.1) drop-shadow(0 0 12px rgba(99,255,180,0.4))";}else{e.currentTarget.style.borderColor="rgba(99,255,180,0.3)";e.currentTarget.style.color=DS.colors.accent;}}}
      onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.borderColor=variants[variant].border?.replace(")","")||"";e.currentTarget.style.color=variants[variant].color||"";}}>
      {icon&&<span>{icon}</span>}{children}
    </button>
  );
}

function Card({children, style={}, glow=false}){
  return(
    <div style={{
      background:DS.colors.surface, border:`1px solid ${DS.colors.border}`,
      borderRadius:16, padding:24, transition:"all 0.25s ease",
      ...(glow?{animation:"glow 3s ease-in-out infinite"}:{}),
      ...style
    }}>{children}</div>
  );
}

function Badge({children, color=DS.colors.accent}){
  return(
    <span style={{
      background:`${color}18`, border:`1px solid ${color}35`,
      color, borderRadius:99, padding:"3px 10px",
      fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase"
    }}>{children}</span>
  );
}

function ScoreRing({score, size=52, color}){
  const c = color||(score>=90?DS.colors.accent:score>=75?DS.colors.orange:DS.colors.red);
  const r=(size-8)/2, circ=2*Math.PI*r, dash=(score/100)*circ;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 6px ${c})`,transition:"stroke-dasharray 1.2s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:size*0.26,fontWeight:900,color:c,fontFamily:DS.fonts.mono}}>{score}</div>
    </div>
  );
}

function WaveAnim({active,color=DS.colors.accent}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:2,height:24}}>
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{
          width:3,borderRadius:99,background:active?color:"rgba(255,255,255,0.15)",
          height:active?undefined:6,
          animation:active?`waveBar ${0.4+i*0.07}s ease-in-out infinite alternate`:undefined,
          animationDelay:`${i*0.05}s`,transition:"background 0.3s"
        }}/>
      ))}
    </div>
  );
}

function Toast({msg,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[]);
  return(
    <div style={{
      position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
      background:"rgba(5,10,8,0.96)",backdropFilter:"blur(20px)",
      border:"1px solid rgba(99,255,180,0.35)",borderRadius:14,
      padding:"13px 24px",color:"#fff",fontSize:13,fontWeight:600,
      zIndex:9999,whiteSpace:"nowrap",animation:"notifDrop 0.3s ease",
      boxShadow:"0 20px 60px rgba(0,0,0,0.6),0 0 30px rgba(99,255,180,0.1)"
    }}>{msg}</div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function Sidebar({page, setPage, collapsed}){
  const nav = [
    {id:"dashboard",icon:"⚡",label:"Dashboard"},
    {id:"upload",icon:"🎬",label:"Upload"},
    {id:"clips",icon:"✂️",label:"My Clips"},
    {id:"captions",icon:"💬",label:"Caption Studio"},
    {id:"growth",icon:"🚀",label:"Growth Engine"},
    {id:"scheduler",icon:"📅",label:"Scheduler"},
    {id:"analytics",icon:"📊",label:"Analytics"},
    {id:"templates",icon:"🎨",label:"Templates"},
    {id:"platforms",icon:"🌐",label:"Platforms"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ];
  return(
    <aside style={{
      width:collapsed?64:220, background:DS.colors.surface,
      borderRight:`1px solid ${DS.colors.border}`,
      display:"flex",flexDirection:"column",height:"100vh",
      position:"sticky",top:0,flexShrink:0,transition:"width 0.3s ease",overflow:"hidden"
    }}>
      {/* Logo */}
      <div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${DS.colors.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:36,height:36,borderRadius:10,flexShrink:0,
            background:"linear-gradient(135deg,#63ffb4,#00d4ff)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:18,fontWeight:900,color:"#000",fontFamily:DS.fonts.display
          }}>CF</div>
          {!collapsed&&(
            <div>
              <div style={{fontFamily:DS.fonts.display,fontSize:20,letterSpacing:1,color:"#fff"}}>CLIPFORGE</div>
              <div style={{fontSize:9,color:DS.colors.textMuted,letterSpacing:2,textTransform:"uppercase"}}>AI Video Studio</div>
            </div>
          )}
        </div>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
        {nav.map(n=>{
          const active=page===n.id;
          return(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"10px 10px",
              borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",width:"100%",
              background:active?"rgba(99,255,180,0.1)":"transparent",
              color:active?DS.colors.accent:DS.colors.textMuted,
              fontWeight:active?700:500,fontSize:13,transition:"all 0.15s ease",
              borderLeft:active?`2px solid ${DS.colors.accent}`:"2px solid transparent",
            }}>
              <span style={{fontSize:16,flexShrink:0}}>{n.icon}</span>
              {!collapsed&&<span style={{whiteSpace:"nowrap"}}>{n.label}</span>}
              {!collapsed&&active&&<div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:DS.colors.accent}}/>}
            </button>
          );
        })}
      </nav>
      {/* User */}
      {!collapsed&&(
        <div style={{padding:"12px 16px",borderTop:`1px solid ${DS.colors.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#b06dff,#ff4d6d)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>Y</div>
            <div style={{overflow:"hidden"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>You</div>
              <div style={{fontSize:10,color:DS.colors.textMuted}}>Free Plan · Unlimited</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ============================================================
// TOPBAR
// ============================================================
function Topbar({title, subtitle, actions}){
  return(
    <div style={{
      display:"flex",justifyContent:"space-between",alignItems:"center",
      marginBottom:28,paddingBottom:20,borderBottom:`1px solid ${DS.colors.border}`
    }}>
      <div>
        <h1 style={{fontSize:26,fontFamily:DS.fonts.display,letterSpacing:1,color:"#fff",lineHeight:1}}>{title}</h1>
        {subtitle&&<p style={{fontSize:13,color:DS.colors.textSecondary,marginTop:5}}>{subtitle}</p>}
      </div>
      {actions&&<div style={{display:"flex",gap:10}}>{actions}</div>}
    </div>
  );
}

// ============================================================
// PAGE: DASHBOARD
// ============================================================
function Dashboard({setPage, showToast}){
  const stats=[
    {icon:"✂️",label:"Clips Generated",value:"2,847",delta:"+12%",color:DS.colors.accent},
    {icon:"🔥",label:"Avg Viral Score",value:"91.4",delta:"+3.2",color:DS.colors.orange},
    {icon:"👁",label:"Total Views",value:"4.8M",delta:"+28%",color:DS.colors.blue},
    {icon:"⏱",label:"Hours Saved",value:"340h",delta:"this month",color:DS.colors.purple},
    {icon:"🚀",label:"Posts Scheduled",value:"47",delta:"upcoming",color:"#ffe066"},
    {icon:"📈",label:"Growth Rate",value:"284%",delta:"vs last month",color:DS.colors.red},
  ];
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="DASHBOARD" subtitle="Your ClipForge command center"
        actions={[
          <Btn key="u" onClick={()=>setPage("upload")} icon="🎬">Upload Video</Btn>
        ]}/>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        {stats.map((s,i)=>(
          <Card key={i} style={{padding:20,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.06}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <span style={{fontSize:22}}>{s.icon}</span>
              <Badge color={s.color}>{s.delta}</Badge>
            </div>
            <div style={{fontSize:28,fontWeight:900,fontFamily:DS.fonts.display,color:"#fff",letterSpacing:0.5}}>{s.value}</div>
            <div style={{fontSize:12,color:DS.colors.textMuted,marginTop:4}}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:18}}>
        {/* Recent clips */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>Recent Clips</div>
            <Btn variant="ghost" size="sm" onClick={()=>setPage("clips")}>View All →</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {MOCK_CLIPS.slice(0,4).map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:DS.colors.surfaceHigh,borderRadius:10}}>
                <div style={{width:36,height:36,borderRadius:8,background:c.thumbnail,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>▶</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                  <div style={{fontSize:11,color:DS.colors.textMuted,marginTop:2}}>{c.duration} · {c.platform}</div>
                </div>
                <ScoreRing score={c.score} size={36}/>
              </div>
            ))}
          </div>
        </Card>
        {/* AI Coach */}
        <Card style={{background:"linear-gradient(135deg,rgba(99,255,180,0.05),rgba(77,159,255,0.05))",border:"1px solid rgba(99,255,180,0.15)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#63ffb4,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"#fff"}}>AI Growth Coach</div>
              <div style={{fontSize:10,color:DS.colors.accent}}>● Online</div>
            </div>
          </div>
          <div style={{fontSize:13,color:DS.colors.textSecondary,lineHeight:1.7,marginBottom:16}}>
            "Your TikTok hook strength dropped 12% this week. I've identified 3 clips ready to go viral — post them between 6-8 PM tonight for maximum reach."
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {GROWTH_TIPS.slice(0,2).map((t,i)=>(
              <div key={i} style={{padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10,borderLeft:`3px solid ${t.priority==="HIGH"?DS.colors.red:DS.colors.orange}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <Badge color={t.priority==="HIGH"?DS.colors.red:DS.colors.orange}>{t.priority}</Badge>
                  <span style={{fontSize:11,color:DS.colors.accent,fontWeight:700}}>{t.impact}</span>
                </div>
                <div style={{fontSize:11,color:DS.colors.textSecondary,lineHeight:1.5}}>{t.tip}</div>
              </div>
            ))}
          </div>
          <Btn variant="accent" size="sm" style={{marginTop:14,width:"100%",justifyContent:"center"}} onClick={()=>setPage("growth")}>
            Open Growth Engine →
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: UPLOAD
// ============================================================
function Upload({setPage, showToast}){
  const [phase, setPhase]=useState("idle");
  const [fileName, setFileName]=useState("");
  const [url, setUrl]=useState("");
  const [drag, setDrag]=useState(false);
  const [stage, setStage]=useState(0);
  const [pct, setPct]=useState(0);
  const inputRef=useRef();

  const stages=[
    {label:"Uploading video file",icon:"⬆️"},
    {label:"Extracting audio stream",icon:"🎵"},
    {label:"Transcribing with WhisperX",icon:"📝"},
    {label:"Detecting viral moments",icon:"🔍"},
    {label:"Scoring with Gemini AI",icon:"🤖"},
    {label:"Burning animated captions",icon:"💬"},
    {label:"Generating thumbnails",icon:"🖼️"},
    {label:"Building growth strategy",icon:"🚀"},
    {label:"Ready — clips generated!",icon:"✅"},
  ];

  const startProcess=(name)=>{
    setFileName(name); setPhase("processing");
    let s=0, p=0;
    const tick=setInterval(()=>{
      p+=1;
      setPct(p);
      if(p>= Math.round((s+1)/stages.length*100)&&s<stages.length-1){s++;setStage(s);}
      if(p>=100){clearInterval(tick);setTimeout(()=>{setPhase("done");showToast("🎉 9 viral clips generated!");},500);}
    },80);
  };

  if(phase==="done") return(
    <div style={{animation:"fadeUp 0.4s ease",textAlign:"center",padding:"80px 40px"}}>
      <div style={{fontSize:72,marginBottom:20,animation:"float 3s ease-in-out infinite"}}>🎬</div>
      <div style={{fontFamily:DS.fonts.display,fontSize:40,letterSpacing:2,color:"#fff",marginBottom:8}}>CLIPS ARE READY</div>
      <div style={{color:DS.colors.textSecondary,marginBottom:32,fontSize:14}}>9 viral clips generated from "{fileName}"</div>
      <div style={{display:"flex",gap:14,justifyContent:"center"}}>
        <Btn onClick={()=>setPage("clips")} size="lg">✂️ View My Clips</Btn>
        <Btn variant="ghost" onClick={()=>{setPhase("idle");setPct(0);setStage(0);}} size="lg">Upload Another</Btn>
      </div>
    </div>
  );

  if(phase==="processing") return(
    <div style={{animation:"fadeUp 0.4s ease",maxWidth:600,margin:"60px auto",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16,animation:"spin 3s linear infinite"}}>⚙️</div>
      <div style={{fontFamily:DS.fonts.display,fontSize:32,letterSpacing:1,color:"#fff",marginBottom:4}}>ANALYZING VIDEO</div>
      <div style={{color:DS.colors.textMuted,fontSize:13,marginBottom:32}}>{fileName}</div>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:99,height:6,overflow:"hidden",marginBottom:12}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#63ffb4,#00d4ff)",borderRadius:99,transition:"width 0.1s linear",boxShadow:"0 0 20px rgba(99,255,180,0.5)"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:32,fontSize:12,color:DS.colors.textMuted}}>
        <span>{stages[stage].icon} {stages[stage].label}</span><span style={{color:DS.colors.accent,fontWeight:700,fontFamily:DS.fonts.mono}}>{pct}%</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {stages.map((s,i)=>(
          <div key={i} style={{padding:"8px 10px",borderRadius:10,background:i<=stage?"rgba(99,255,180,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${i<=stage?"rgba(99,255,180,0.2)":"rgba(255,255,255,0.05)"}`,fontSize:11,color:i<stage?DS.colors.accent:i===stage?"#fff":DS.colors.textMuted,fontWeight:i===stage?700:400,transition:"all 0.3s ease"}}>
            {i<stage?"✓ ":i===stage?"⟳ ":""}{s.label}
          </div>
        ))}
      </div>
    </div>
  );

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="UPLOAD VIDEO" subtitle="Turn any long video into viral clips with AI"/>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        {/* Drop zone */}
        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)startProcess(f.name);}}
          onClick={()=>inputRef.current.click()}
          style={{border:`2px dashed ${drag?DS.colors.accent:"rgba(255,255,255,0.12)"}`,borderRadius:20,padding:"56px 40px",textAlign:"center",cursor:"pointer",background:drag?"rgba(99,255,180,0.03)":"transparent",transition:"all 0.3s ease",marginBottom:16,position:"relative",overflow:"hidden",animation:"borderPulse 3s ease-in-out infinite"}}>
          <input ref={inputRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])startProcess(e.target.files[0].name);}}/>
          <div style={{fontSize:56,marginBottom:16,animation:"float 3s ease-in-out infinite"}}>🎬</div>
          <div style={{fontFamily:DS.fonts.display,fontSize:28,letterSpacing:1,color:"#fff",marginBottom:8}}>DROP YOUR VIDEO HERE</div>
          <div style={{color:DS.colors.textSecondary,fontSize:13,marginBottom:24,lineHeight:1.7}}>MP4 · MOV · AVI · MKV · WebM up to 10GB<br/>Podcasts · Interviews · Webinars · Vlogs · Streams · Lectures</div>
          <Btn size="lg" icon="⚡">Choose Video File</Btn>
        </div>
        {/* URL input */}
        <div style={{display:"flex",gap:10,marginBottom:32}}>
          <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&url.trim()&&startProcess(url)}
            placeholder="Or paste YouTube · Loom · Vimeo · Twitch URL here..."
            style={{flex:1,background:DS.colors.surface,border:`1px solid ${DS.colors.border}`,borderRadius:12,padding:"13px 18px",color:"#fff",fontSize:13}}/>
          <Btn onClick={()=>url.trim()&&startProcess(url)}>Analyze →</Btn>
        </div>
        {/* Feature grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[
            {icon:"🤖",title:"Gemini AI Brain",desc:"Scores virality, writes hooks, titles, and hashtags per platform"},
            {icon:"🎯",title:"HookForge™",desc:"Finds the perfect first 3 seconds that stops every scroll"},
            {icon:"💬",title:"Auto Captions",desc:"WhisperX 99% accuracy with animated word-highlight styles"},
            {icon:"📐",title:"Auto Reframe",desc:"9:16 · 1:1 · 16:9 — perfect for every platform automatically"},
            {icon:"🚀",title:"AlgoMatch™",desc:"Matches each clip to the platform where it will perform best"},
            {icon:"📅",title:"AI Scheduler",desc:"Posts at the exact time your audience is most active"},
          ].map((f,i)=>(
            <Card key={i} style={{padding:16,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.07}s`}}>
              <div style={{fontSize:24,marginBottom:8}}>{f.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:4}}>{f.title}</div>
              <div style={{fontSize:11,color:DS.colors.textMuted,lineHeight:1.5}}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: CLIPS
// ============================================================
function Clips({showToast}){
  const [filter,setFilter]=useState("All");
  const [sort,setSort]=useState("score");
  const [selected,setSelected]=useState(null);
  const platforms=["All","TikTok","Reels","Shorts","Twitter","LinkedIn"];

  const sorted=[...MOCK_CLIPS].sort((a,b)=>sort==="score"?b.score-a.score:b.views.localeCompare(a.views));
  const filtered=filter==="All"?sorted:sorted.filter(c=>c.platform===filter||c.tags.includes(filter));

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="MY CLIPS" subtitle={`${MOCK_CLIPS.length} clips ready · Sorted by viral score`}
        actions={[
          <Btn key="e" variant="ghost" size="sm" onClick={()=>showToast("📦 All clips exported!")}>⬇ Export All</Btn>,
          <Btn key="s" size="sm" onClick={()=>showToast("📅 All clips scheduled!")}>📅 Schedule All</Btn>
        ]}/>
      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        {platforms.map(p=>(
          <button key={p} onClick={()=>setFilter(p)} style={{padding:"7px 16px",borderRadius:99,border:`1px solid ${filter===p?DS.colors.accent:"rgba(255,255,255,0.08)"}`,background:filter===p?DS.colors.accentDim:"transparent",color:filter===p?DS.colors.accent:DS.colors.textMuted,fontSize:12,fontWeight:filter===p?700:500,cursor:"pointer",transition:"all 0.15s ease"}}>{p}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:12,color:DS.colors.textMuted}}>Sort:</span>
          {["score","views"].map(s=>(
            <button key={s} onClick={()=>setSort(s)} style={{padding:"6px 12px",borderRadius:99,border:`1px solid ${sort===s?DS.colors.accent:"rgba(255,255,255,0.08)"}`,background:"transparent",color:sort===s?DS.colors.accent:DS.colors.textMuted,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.15s ease",textTransform:"capitalize"}}>{s}</button>
          ))}
        </div>
      </div>
      {/* Clip grid */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map((clip,i)=>(
          <div key={clip.id} onClick={()=>setSelected(selected===clip.id?null:clip.id)}
            style={{background:selected===clip.id?DS.colors.surfaceHigh:DS.colors.surface,border:`1px solid ${selected===clip.id?DS.colors.borderHover:DS.colors.border}`,borderRadius:16,padding:20,cursor:"pointer",transition:"all 0.2s ease",animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.06}s`}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              {/* Thumb */}
              <div style={{width:88,height:88,borderRadius:12,background:clip.thumbnail,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                <div style={{fontSize:28,opacity:0.7}}>▶</div>
                <div style={{position:"absolute",bottom:4,right:4,background:"rgba(0,0,0,0.8)",borderRadius:4,padding:"1px 5px",fontSize:10,fontFamily:DS.fonts.mono}}>{clip.duration}</div>
                {clip.viral&&<div style={{position:"absolute",top:4,left:4,background:"linear-gradient(135deg,#ff6b6b,#feca57)",borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:800,color:"#000"}}>🔥 VIRAL</div>}
              </div>
              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:15,color:"#fff",marginBottom:6,lineHeight:1.3}}>{clip.title}</div>
                <div style={{color:DS.colors.textMuted,fontSize:12,marginBottom:10,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{clip.transcript}"</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  {clip.tags.map(t=><Badge key={t} color={DS.colors.accent}>{t}</Badge>)}
                  <Badge color={DS.colors.blue}>{clip.platform}</Badge>
                  <Badge color={DS.colors.purple}>{clip.views} views</Badge>
                </div>
                {/* Platform scores */}
                <div style={{display:"flex",gap:12}}>
                  {Object.entries(clip.platformScore).map(([p,s])=>(
                    <div key={p} style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:10,color:DS.colors.textMuted}}>{p}</span>
                      <div style={{width:32,height:4,borderRadius:99,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${s}%`,background:s>=90?DS.colors.accent:s>=80?DS.colors.orange:DS.colors.red,borderRadius:99}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:s>=90?DS.colors.accent:s>=80?DS.colors.orange:DS.colors.red,fontFamily:DS.fonts.mono}}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Score + actions */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flexShrink:0}}>
                <ScoreRing score={clip.score} color={clip.color}/>
                <div style={{fontSize:10,color:DS.colors.textMuted,textAlign:"center"}}>Viral Score</div>
                <div style={{display:"flex",gap:6}}>
                  <Btn variant="accent" size="sm" onClick={e=>{e.stopPropagation();showToast(`📅 "${clip.title}" scheduled!`);}}>Schedule</Btn>
                  <Btn variant="ghost" size="sm" onClick={e=>{e.stopPropagation();showToast(`⬇ Downloading...`);}}>⬇</Btn>
                </div>
              </div>
            </div>
            {/* Expanded panel */}
            {selected===clip.id&&(
              <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${DS.colors.border}`,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,animation:"fadeIn 0.2s ease"}}>
                <div style={{padding:14,background:"rgba(99,255,180,0.05)",borderRadius:12,border:"1px solid rgba(99,255,180,0.12)"}}>
                  <div style={{fontSize:11,color:DS.colors.accent,fontWeight:700,marginBottom:8}}>🎯 HOOK ANALYSIS</div>
                  <div style={{fontSize:12,color:DS.colors.textSecondary,lineHeight:1.6}}>Hook score: <strong style={{color:"#fff"}}>{clip.hookScore}/100</strong><br/>Best opening: First word creates curiosity gap<br/>Improvement: Add specific number in first 3 words</div>
                </div>
                <div style={{padding:14,background:"rgba(77,159,255,0.05)",borderRadius:12,border:"1px solid rgba(77,159,255,0.12)"}}>
                  <div style={{fontSize:11,color:DS.colors.blue,fontWeight:700,marginBottom:8}}>📅 BEST POST TIME</div>
                  <div style={{fontSize:12,color:DS.colors.textSecondary,lineHeight:1.6}}>Post on: <strong style={{color:"#fff"}}>{clip.bestDay}</strong><br/>Time: <strong style={{color:"#fff"}}>{clip.bestTime}</strong><br/>Platform: <strong style={{color:"#fff"}}>{clip.platform}</strong></div>
                </div>
                <div style={{padding:14,background:"rgba(176,109,255,0.05)",borderRadius:12,border:"1px solid rgba(176,109,255,0.12)"}}>
                  <div style={{fontSize:11,color:DS.colors.purple,fontWeight:700,marginBottom:8}}>📝 AI CAPTION</div>
                  <div style={{fontSize:11,color:DS.colors.textSecondary,lineHeight:1.6,fontStyle:"italic"}}>"{clip.title} 🔥 {clip.tags.map(t=>`#${t}`).join(' ')} #viral #fyp #trending"</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: GROWTH ENGINE
// ============================================================
function GrowthEngine({showToast}){
  const [niche,setNiche]=useState("");
  const [analyzing,setAnalyzing]=useState(false);
  const [plan,setPlan]=useState(null);
  const [chatInput,setChatInput]=useState("");
  const [chatHistory,setChatHistory]=useState([
    {role:"ai",msg:"Hey! I'm your AI Growth Coach. Tell me your niche and I'll build you a zero-to-viral strategy. What kind of content do you make?"}
  ]);

  const analyze=()=>{
    if(!niche.trim())return;
    setAnalyzing(true);
    setChatHistory(h=>[...h,{role:"user",msg:niche},{role:"ai",msg:"Analyzing your niche and building your personalized growth strategy...⚡"}]);
    setTimeout(()=>{
      setAnalyzing(false);
      setPlan(true);
      setChatHistory(h=>[...h,{role:"ai",msg:`Perfect! I've analyzed the ${niche} niche across all platforms. Your 30-day zero-to-viral roadmap is ready. Here's what I found: TikTok has 340% less competition in your niche right now — that's your fastest growth path. I've scheduled your first 7 days of content for optimal algorithm performance. Your first clip should go out TODAY at 7:00 PM. 🚀`}]);
    },2500);
  };

  const sendChat=()=>{
    if(!chatInput.trim())return;
    const msg=chatInput; setChatInput("");
    setChatHistory(h=>[...h,{role:"user",msg}]);
    setTimeout(()=>{
      setChatHistory(h=>[...h,{role:"ai",msg:`Great question about "${msg.slice(0,30)}...". Based on your content data, I recommend focusing on hook quality over posting frequency right now. Your retention drops at the 8-second mark — that's where we need to improve. Want me to rewrite your top 3 clip hooks?`}]);
    },1200);
  };

  const weekPlan=[
    {day:"Mon",posts:3,platforms:["TikTok","Reels"],times:["7AM","12PM","7PM"],focus:"Hook testing"},
    {day:"Tue",posts:3,platforms:["TikTok","Shorts"],times:["8AM","1PM","8PM"],focus:"Value content"},
    {day:"Wed",posts:4,platforms:["TikTok","Reels","Shorts"],times:["7AM","11AM","3PM","7PM"],focus:"Peak day"},
    {day:"Thu",posts:3,platforms:["TikTok","LinkedIn"],times:["9AM","12PM","6PM"],focus:"Authority build"},
    {day:"Fri",posts:3,platforms:["TikTok","Reels"],times:["7AM","2PM","7PM"],focus:"Entertainment"},
    {day:"Sat",posts:2,platforms:["Reels","Shorts"],times:["10AM","5PM"],focus:"Behind scenes"},
    {day:"Sun",posts:2,platforms:["TikTok","Reels"],times:["11AM","6PM"],focus:"Reflection"},
  ];

  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="GROWTH ENGINE" subtitle="AI-powered zero-to-viral strategy — powered by Gemini Algorithm Whisperer"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        {/* AI Coach Chat */}
        <Card style={{display:"flex",flexDirection:"column",height:480}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${DS.colors.border}`}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#63ffb4,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>AI Growth Coach</div>
              <div style={{fontSize:10,color:DS.colors.accent,display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:DS.colors.accent,display:"inline-block",animation:"pulse 2s ease-in-out infinite"}}/>Powered by Gemini Algorithm Whisperer</div>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {chatHistory.map((c,i)=>(
              <div key={i} style={{display:"flex",justifyContent:c.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:c.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:c.role==="user"?"linear-gradient(135deg,#63ffb4,#00d4ff)":"rgba(255,255,255,0.05)",color:c.role==="user"?"#000":"#fff",fontSize:12,lineHeight:1.6,fontWeight:c.role==="user"?600:400}}>
                  {c.msg}
                </div>
              </div>
            ))}
            {analyzing&&<div style={{display:"flex",gap:6,padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:14,width:"fit-content"}}><WaveAnim active={true}/></div>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
              placeholder={plan?"Ask your AI coach anything...":"Tell me your niche to get started..."}
              style={{flex:1,background:DS.colors.surfaceHigh,border:`1px solid ${DS.colors.border}`,borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:12}}
              onBlur={e=>{if(!plan&&e.target.value.trim()){setNiche(e.target.value);}}}/>
            <Btn size="sm" onClick={()=>{if(!plan){setNiche(chatInput);analyze();}else sendChat();}}>
              {plan?"Send":"Analyze"}
            </Btn>
          </div>
        </Card>
        {/* Algorithm Intel */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:14}}>⚡ Algorithm Intel — Live</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {platform:"TikTok",signal:"Completion rate >70% = instant boost",urgency:"NOW",color:"#ff0050"},
                {platform:"Instagram",signal:"Reels saved = 3x reach multiplier",urgency:"HIGH",color:"#e1306c"},
                {platform:"YouTube",signal:"CTR >10% triggers suggested feed",urgency:"HIGH",color:"#ff0000"},
                {platform:"LinkedIn",signal:"Post at 8AM Tues = peak B2B reach",urgency:"MEDIUM",color:"#0077b5"},
              ].map((a,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:DS.colors.surfaceHigh,borderRadius:10}}>
                  <div style={{width:28,height:28,borderRadius:6,background:`${a.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>📡</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:a.color}}>{a.platform}</div>
                    <div style={{fontSize:11,color:DS.colors.textSecondary}}>{a.signal}</div>
                  </div>
                  <Badge color={a.urgency==="NOW"?DS.colors.red:a.urgency==="HIGH"?DS.colors.orange:DS.colors.blue}>{a.urgency}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{padding:18,background:"linear-gradient(135deg,rgba(99,255,180,0.04),rgba(0,212,255,0.04))",border:"1px solid rgba(99,255,180,0.12)"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:4}}>🎯 Your Growth Score</div>
            <div style={{fontSize:11,color:DS.colors.textMuted,marginBottom:14}}>Based on current content strategy</div>
            <div style={{display:"flex",gap:16,justifyContent:"center",marginBottom:14}}>
              {[{label:"Hook",val:72},{label:"Consistency",val:45},{label:"Timing",val:88},{label:"Engagement",val:61}].map(g=>(
                <div key={g.label} style={{textAlign:"center"}}>
                  <ScoreRing score={g.val} size={46} color={g.val>=80?DS.colors.accent:g.val>=60?DS.colors.orange:DS.colors.red}/>
                  <div style={{fontSize:10,color:DS.colors.textMuted,marginTop:4}}>{g.label}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"10px 12px",background:"rgba(99,255,180,0.06)",borderRadius:10,fontSize:12,color:DS.colors.textSecondary,lineHeight:1.6}}>
              <strong style={{color:DS.colors.accent}}>Top priority:</strong> Your consistency score is hurting growth. Post 3x/day for 14 days to trigger algorithm favour.
            </div>
          </Card>
        </div>
      </div>
      {/* Weekly Content Plan */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>📅 AI-Generated 7-Day Content Calendar</div>
          <Btn variant="accent" size="sm" onClick={()=>showToast("📅 Calendar synced to Scheduler!")}>Sync to Scheduler</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
          {weekPlan.map((day,i)=>(
            <div key={i} style={{padding:12,background:i===0?"rgba(99,255,180,0.08)":DS.colors.surfaceHigh,borderRadius:12,border:`1px solid ${i===0?DS.colors.borderHover:DS.colors.border}`,textAlign:"center"}}>
              <div style={{fontWeight:800,fontSize:13,color:i===0?DS.colors.accent:"#fff",fontFamily:DS.fonts.display,letterSpacing:0.5,marginBottom:6}}>{day.day}</div>
              <div style={{fontSize:22,fontWeight:900,color:i===0?DS.colors.accent:DS.colors.textSecondary,fontFamily:DS.fonts.mono,marginBottom:4}}>{day.posts}</div>
              <div style={{fontSize:9,color:DS.colors.textMuted,marginBottom:6}}>posts</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {day.times.map((t,j)=><div key={j} style={{fontSize:9,color:DS.colors.textMuted,background:"rgba(255,255,255,0.04)",borderRadius:4,padding:"2px 4px"}}>{t}</div>)}
              </div>
              <div style={{fontSize:9,color:DS.colors.textMuted,marginTop:6,lineHeight:1.4}}>{day.focus}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// PAGE: SCHEDULER
// ============================================================
function Scheduler({showToast}){
  const [view,setView]=useState("week");
  const hours=["9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM"];
  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const scheduled={
    "Mon-7 PM":{clip:"The ONE Habit...",platform:"TikTok",color:"#ff0050",score:97},
    "Wed-12 PM":{clip:"Nobody Talks...",platform:"Instagram",color:"#e1306c",score:94},
    "Thu-3 PM":{clip:"I Was Wrong...",platform:"YouTube",color:"#ff0000",score:91},
    "Fri-7 PM":{clip:"From Broke...",platform:"TikTok",color:"#ff0050",score:88},
    "Tue-12 PM":{clip:"Stop Doing This",platform:"LinkedIn",color:"#0077b5",score:85},
  };
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="SCHEDULER" subtitle="AI picks the best time — you just approve"
        actions={[
          <Btn key="a" variant="ghost" size="sm" onClick={()=>showToast("🤖 AI scheduled all clips optimally!")}>🤖 Auto-Schedule All</Btn>,
          <Btn key="n" size="sm" onClick={()=>showToast("+ New post draft created")}>+ New Post</Btn>
        ]}/>
      {/* Queue */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:18}}>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:12}}>📋 Queue ({SCHEDULED_POSTS.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {SCHEDULED_POSTS.map((p,i)=>(
              <Card key={i} style={{padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <Badge color={p.status==="scheduled"?DS.colors.accent:DS.colors.orange}>{p.status}</Badge>
                  <ScoreRing score={p.score} size={32}/>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:4,lineHeight:1.3}}>{p.clip}</div>
                <div style={{display:"flex",gap:6}}>
                  <Badge color={DS.colors.blue}>{p.platform}</Badge>
                  <span style={{fontSize:11,color:DS.colors.textMuted}}>{p.day} · {p.time}</span>
                </div>
                <div style={{display:"flex",gap:6,marginTop:10}}>
                  <Btn variant="accent" size="sm" style={{flex:1,justifyContent:"center"}} onClick={()=>showToast("✅ Post confirmed!")}>Confirm</Btn>
                  <Btn variant="ghost" size="sm" onClick={()=>showToast("✏️ Opening editor...")}>Edit</Btn>
                </div>
              </Card>
            ))}
          </div>
          {/* Platform status */}
          <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:10}}>🌐 Connected Platforms</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {PLATFORMS.slice(0,4).map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:DS.colors.surface,border:`1px solid ${DS.colors.border}`,borderRadius:10}}>
                <span style={{fontSize:16}}>{p.icon}</span>
                <span style={{fontSize:12,color:"#fff",flex:1}}>{p.name}</span>
                <button onClick={()=>showToast(`🔗 Connecting to ${p.name}...`)} style={{fontSize:10,padding:"4px 10px",borderRadius:99,border:`1px solid rgba(99,255,180,0.3)`,background:"rgba(99,255,180,0.08)",color:DS.colors.accent,cursor:"pointer",fontWeight:700}}>Connect</button>
              </div>
            ))}
          </div>
        </div>
        {/* Calendar grid */}
        <Card style={{padding:18,overflow:"auto"}}>
          <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:14}}>Week View — AI Optimal Times Highlighted</div>
          <div style={{display:"grid",gridTemplateColumns:`60px repeat(7,1fr)`,gap:2,minWidth:500}}>
            <div/>
            {days.map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:DS.colors.textMuted,padding:"4px 0",fontFamily:DS.fonts.display,letterSpacing:0.5}}>{d}</div>
            ))}
            {hours.map(h=>(
              <>
                <div key={h} style={{fontSize:10,color:DS.colors.textMuted,paddingRight:8,textAlign:"right",paddingTop:4,fontFamily:DS.fonts.mono}}>{h}</div>
                {days.map(d=>{
                  const key=`${d}-${h}`;
                  const post=scheduled[key];
                  const isOptimal=["7 PM","12 PM","9 AM"].includes(h);
                  return(
                    <div key={d} onClick={()=>post&&showToast(`📅 ${post.clip} — ${post.platform}`)}
                      style={{height:32,borderRadius:6,background:post?`${post.color}22`:isOptimal?"rgba(99,255,180,0.03)":"transparent",border:`1px solid ${post?`${post.color}44`:isOptimal?"rgba(99,255,180,0.08)":"rgba(255,255,255,0.03)"}`,cursor:post?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s ease",overflow:"hidden",padding:"0 4px"}}>
                      {post&&<div style={{fontSize:9,color:post.color,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{post.platform}</div>}
                      {!post&&isOptimal&&<div style={{width:4,height:4,borderRadius:"50%",background:"rgba(99,255,180,0.3)"}}/>}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: ANALYTICS
// ============================================================
function Analytics(){
  const platformData=[
    {name:"TikTok",views:"2.4M",followers:"+1.2K",engagement:"8.4%",growth:"+284%",color:"#ff0050"},
    {name:"Instagram",views:"1.1M",followers:"+680",engagement:"6.2%",growth:"+156%",color:"#e1306c"},
    {name:"YouTube",views:"890K",followers:"+340",engagement:"9.8%",growth:"+98%",color:"#ff0000"},
    {name:"LinkedIn",views:"340K",followers:"+180",engagement:"12.4%",growth:"+67%",color:"#0077b5"},
  ];
  const topClips=[
    {title:"The ONE Habit...",views:"3.2M",platform:"TikTok",score:97},
    {title:"Nobody Talks About This",views:"1.8M",platform:"Reels",score:94},
    {title:"I Was Completely Wrong",views:"945K",platform:"Shorts",score:91},
  ];
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="ANALYTICS" subtitle="Cross-platform performance powered by AI insights"/>
      {/* Platform cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {platformData.map((p,i)=>(
          <Card key={i} style={{padding:18,borderTop:`3px solid ${p.color}`}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:12}}>{p.name}</div>
            <div style={{fontSize:24,fontWeight:900,fontFamily:DS.fonts.display,color:"#fff",letterSpacing:0.5}}>{p.views}</div>
            <div style={{fontSize:11,color:DS.colors.textMuted,marginBottom:10}}>total views</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:DS.colors.textMuted}}>New followers</span>
                <span style={{color:DS.colors.accent,fontWeight:700}}>{p.followers}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:DS.colors.textMuted}}>Engagement</span>
                <span style={{color:"#fff",fontWeight:700}}>{p.engagement}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:DS.colors.textMuted}}>Growth</span>
                <span style={{color:DS.colors.accent,fontWeight:700}}>{p.growth}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:18}}>
        {/* Engagement chart simulation */}
        <Card>
          <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:18}}>📈 Views Over Time (Last 30 Days)</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:120,marginBottom:8}}>
            {[20,35,28,45,38,55,62,48,70,58,80,72,90,85,95,88,100,92,85,96,78,88,94,87,99,91,96,88,100,97].map((v,i)=>(
              <div key={i} style={{flex:1,background:`linear-gradient(0deg,${DS.colors.accent},rgba(99,255,180,0.3))`,borderRadius:"3px 3px 0 0",height:`${v}%`,minWidth:4,transition:"height 0.3s ease",opacity:0.8}}/>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:DS.colors.textMuted}}>
            <span>Apr 1</span><span>Apr 15</span><span>Apr 30</span>
          </div>
        </Card>
        {/* Top clips */}
        <Card>
          <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:16}}>🏆 Top Performing Clips</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {topClips.map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:DS.colors.surfaceHigh,borderRadius:10}}>
                <div style={{width:28,height:28,borderRadius:6,background:`linear-gradient(135deg,${DS.colors.accent},#00d4ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:"#000",flexShrink:0}}>#{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                  <div style={{fontSize:11,color:DS.colors.textMuted}}>{c.platform} · {c.views}</div>
                </div>
                <ScoreRing score={c.score} size={34}/>
              </div>
            ))}
          </div>
          <Card style={{marginTop:14,padding:14,background:"rgba(99,255,180,0.04)",border:"1px solid rgba(99,255,180,0.12)"}}>
            <div style={{fontSize:11,color:DS.colors.textMuted,marginBottom:4}}>🤖 AI Insight</div>
            <div style={{fontSize:12,color:DS.colors.textSecondary,lineHeight:1.6}}>"Your transformation story clips outperform all other formats by 3.2x. Create more of these to 10x your growth rate."</div>
          </Card>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: CAPTION STUDIO
// ============================================================
function CaptionStudio({showToast}){
  const [style,setStyle]=useState("bold");
  const [font,setFont]=useState("Outfit");
  const [color,setColor]=useState("#63ffb4");
  const [position,setPosition]=useState("bottom");
  const styles=["bold","minimal","fire","neon","shadow","outline","karaoke","typewriter"];
  const fonts=["Outfit","Bebas Neue","JetBrains Mono","Georgia","Impact","Courier"];
  const colors=[DS.colors.accent,"#fff","#ff0050","#ffe066","#4d9fff","#b06dff","#ff9a3c","#ff4d6d"];
  const preview="This moment changed EVERYTHING for me...";
  const words=preview.split(" ");
  const [activeWord,setActiveWord]=useState(0);
  useEffect(()=>{
    const t=setInterval(()=>setActiveWord(w=>(w+1)%words.length),600);
    return()=>clearInterval(t);
  },[]);
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="CAPTION STUDIO" subtitle="Animated captions that stop the scroll"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:18}}>
        {/* Controls */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:14}}>🎨 Caption Style</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
              {styles.map(s=>(
                <button key={s} onClick={()=>setStyle(s)} style={{padding:"8px 4px",borderRadius:8,border:`1px solid ${style===s?DS.colors.accent:DS.colors.border}`,background:style===s?DS.colors.accentDim:"transparent",color:style===s?DS.colors.accent:DS.colors.textMuted,fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize",transition:"all 0.15s"}}>{s}</button>
              ))}
            </div>
            <div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:10}}>🔤 Font</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {fonts.map(f=>(
                <button key={f} onClick={()=>setFont(f)} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${font===f?DS.colors.accent:DS.colors.border}`,background:font===f?DS.colors.accentDim:"transparent",color:font===f?DS.colors.accent:DS.colors.textMuted,fontSize:11,cursor:"pointer",fontFamily:f,transition:"all 0.15s"}}>{f}</button>
              ))}
            </div>
            <div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:10}}>🎨 Color</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {colors.map(c=>(
                <button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${color===c?"#fff":"transparent"}`,cursor:"pointer",transition:"all 0.15s",boxShadow:color===c?`0 0 10px ${c}`:"none"}}/>
              ))}
            </div>
            <div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:10}}>📍 Position</div>
            <div style={{display:"flex",gap:8}}>
              {["top","center","bottom"].map(p=>(
                <button key={p} onClick={()=>setPosition(p)} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1px solid ${position===p?DS.colors.accent:DS.colors.border}`,background:position===p?DS.colors.accentDim:"transparent",color:position===p?DS.colors.accent:DS.colors.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"capitalize",transition:"all 0.15s"}}>{p}</button>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:12}}>⚡ Quick Actions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Btn variant="accent" size="sm" style={{justifyContent:"center"}} onClick={()=>showToast("🤖 AI optimized captions for virality!")}>🤖 AI Optimize for Virality</Btn>
              <Btn variant="ghost" size="sm" style={{justifyContent:"center"}} onClick={()=>showToast("🌍 Translating to 50 languages...")}>🌍 Translate to 50 Languages</Btn>
              <Btn variant="ghost" size="sm" style={{justifyContent:"center"}} onClick={()=>showToast("✂️ Removing filler words...")}>✂️ Remove Filler Words (um, uh)</Btn>
              <Btn variant="ghost" size="sm" style={{justifyContent:"center"}} onClick={()=>showToast("😂 Adding emoji overlays...")}>😂 Add Emoji Overlays</Btn>
              <Btn size="sm" style={{justifyContent:"center"}} onClick={()=>showToast("✅ Applied to all clips!")}>✅ Apply to All Clips</Btn>
            </div>
          </Card>
        </div>
        {/* Preview */}
        <Card style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:500,background:"#000",border:`1px solid ${DS.colors.border}`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1a1a2e,#0a0a0f)"}}/>
          <div style={{position:"relative",width:"90%",maxWidth:280,aspectRatio:"9/16",background:"linear-gradient(135deg,#1a2a1a,#0a1a0a)",borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:position==="top"?"flex-start":position==="center"?"center":"flex-end",padding:16,boxShadow:"0 20px 60px rgba(0,0,0,0.8)"}}>
            <div style={{background:"rgba(0,0,0,0.0)",padding:"8px 0",textAlign:"center"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
                {words.map((w,i)=>(
                  <span key={i} style={{
                    fontFamily:font,fontWeight:900,fontSize:18,
                    color:i===activeWord?color:"rgba(255,255,255,0.85)",
                    textShadow:i===activeWord?`0 0 20px ${color},0 2px 4px rgba(0,0,0,0.8)`:"0 2px 4px rgba(0,0,0,0.8)",
                    transform:i===activeWord?"scale(1.15)":"scale(1)",
                    display:"inline-block",transition:"all 0.15s ease",
                    textDecoration:style==="outline"?`2px solid ${color}`:"none",
                    background:style==="neon"&&i===activeWord?`${color}22`:"transparent",
                    padding:style==="neon"?"2px 4px":"0",borderRadius:4,
                  }}>{w}</span>
                ))}
              </div>
            </div>
            {/* Fake video overlay */}
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.15}}>
              <div style={{fontSize:60}}>🎬</div>
            </div>
          </div>
          <div style={{position:"relative",marginTop:14,fontSize:11,color:DS.colors.textMuted,textAlign:"center"}}>Live Preview · {style} style · {font}</div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: PLATFORMS
// ============================================================
function PlatformsPage({showToast}){
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="PLATFORMS" subtitle="Connect all your social accounts for direct publishing"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {PLATFORMS.map((p,i)=>(
          <Card key={i} style={{padding:20,borderTop:`3px solid ${p.color}`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${p.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{p.icon}</div>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{p.name}</div>
                <div style={{fontSize:11,color:DS.colors.textMuted}}>Not connected</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {["Auto-publish clips","Schedule posts","Track analytics","Trending audio sync"].map((f,j)=>(
                <div key={j} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:DS.colors.textMuted}}>
                  <span style={{color:DS.colors.accent}}>✓</span>{f}
                </div>
              ))}
            </div>
            <Btn style={{width:"100%",justifyContent:"center",background:`linear-gradient(135deg,${p.color},${p.color}aa)`}} onClick={()=>showToast(`🔗 Connecting to ${p.name}...`)}>Connect {p.name}</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: SETTINGS
// ============================================================
function Settings({showToast}){
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="SETTINGS" subtitle="Configure ClipForge to your preferences"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:16}}>👤 Profile</div>
            {[{label:"Display Name",val:"Your Name"},{label:"Email",val:"you@email.com"},{label:"Niche",val:"Business & Entrepreneurship"},{label:"Timezone",val:"UTC+0"}].map((f,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:11,color:DS.colors.textMuted,marginBottom:4}}>{f.label}</div>
                <input defaultValue={f.val} style={{width:"100%",background:DS.colors.surfaceHigh,border:`1px solid ${DS.colors.border}`,borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12}}/>
              </div>
            ))}
            <Btn onClick={()=>showToast("✅ Profile saved!")}>Save Changes</Btn>
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:16}}>🔑 API Keys</div>
            {[{label:"Gemini API Key 1 (Analyst)",ph:"AIza..."},{label:"Gemini API Key 2 (Algorithm Whisperer)",ph:"AIza..."},{label:"HuggingFace Token",ph:"hf_..."},{label:"Pyannote Token",ph:"hf_..."}].map((f,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:11,color:DS.colors.textMuted,marginBottom:4}}>{f.label}</div>
                <input type="password" placeholder={f.ph} style={{width:"100%",background:DS.colors.surfaceHigh,border:`1px solid ${DS.colors.border}`,borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12,fontFamily:DS.fonts.mono}}/>
              </div>
            ))}
            <Btn onClick={()=>showToast("🔑 Keys saved securely!")}>Save Keys</Btn>
          </Card>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:16}}>⚙️ Processing Defaults</div>
            {[
              {label:"Default Aspect Ratio",options:["9:16 (Vertical)","1:1 (Square)","16:9 (Landscape)"]},
              {label:"Caption Style",options:["Bold","Minimal","Neon","Karaoke"]},
              {label:"Whisper Model",options:["large-v3 (Best)","medium (Faster)","small (Fastest)"]},
              {label:"Clips Per Video",options:["5 clips","10 clips","15 clips","Maximum"]},
            ].map((s,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:11,color:DS.colors.textMuted,marginBottom:4}}>{s.label}</div>
                <select style={{width:"100%",background:DS.colors.surfaceHigh,border:`1px solid ${DS.colors.border}`,borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12}}>
                  {s.options.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <Btn onClick={()=>showToast("⚙️ Settings saved!")}>Save Defaults</Btn>
          </Card>
          <Card style={{background:"linear-gradient(135deg,rgba(99,255,180,0.04),rgba(0,212,255,0.04))",border:"1px solid rgba(99,255,180,0.15)"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:8}}>⚡ ClipForge Status</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"HF Spaces Backend",status:"Online",color:DS.colors.accent},
                {label:"WhisperX Engine",status:"Ready",color:DS.colors.accent},
                {label:"Gemini AI (Analyst)",status:"Connected",color:DS.colors.accent},
                {label:"Gemini AI (Whisperer)",status:"Connected",color:DS.colors.accent},
                {label:"Cloudflare R2",status:"Connected",color:DS.colors.accent},
                {label:"Supabase DB",status:"Online",color:DS.colors.accent},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8}}>
                  <span style={{fontSize:12,color:DS.colors.textSecondary}}>{s.label}</span>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:s.color,animation:"pulse 2s ease-in-out infinite"}}/>
                    <span style={{fontSize:11,color:s.color,fontWeight:700}}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: TEMPLATES
// ============================================================
function Templates({showToast}){
  const templates=[
    {name:"Viral Hook Pro",desc:"Bold text, emoji burst, neon highlight on keywords",preview:"#63ffb4",uses:"47K"},
    {name:"Clean Minimal",desc:"White captions, subtle shadow, bottom position",preview:"#ffffff",uses:"32K"},
    {name:"Fire Podcast",desc:"Orange gradient, word bounce, speaker name overlay",preview:"#ff9a3c",uses:"28K"},
    {name:"TikTok Native",desc:"Mimics TikTok's default style — maximum familiarity",preview:"#ff0050",uses:"91K"},
    {name:"LinkedIn Pro",desc:"Clean, professional, bottom third, no emojis",preview:"#0077b5",uses:"15K"},
    {name:"Karaoke Wave",desc:"Words light up in sequence, music-video style",preview:"#b06dff",uses:"22K"},
    {name:"YouTube Shorts",desc:"High contrast, centered, bold shadow text",preview:"#ff0000",uses:"38K"},
    {name:"Breaking News",desc:"Red ticker, urgent style, high retention format",preview:"#ff4d6d",uses:"12K"},
    {name:"Education Clean",desc:"Whiteboard style, numbered points, clear fonts",preview:"#4d9fff",uses:"19K"},
  ];
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <Topbar title="TEMPLATES" subtitle="200+ proven viral caption and brand templates"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {templates.map((t,i)=>(
          <Card key={i} style={{padding:0,overflow:"hidden",cursor:"pointer",transition:"all 0.2s ease",animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.05}s`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor="rgba(99,255,180,0.25)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=DS.colors.border;}}>
            <div style={{height:100,background:`linear-gradient(135deg,${t.preview}22,${t.preview}08)`,display:"flex",alignItems:"center",justifyContent:"center",borderBottom:`1px solid ${DS.colors.border}`,position:"relative"}}>
              <div style={{fontSize:18,fontWeight:900,color:t.preview,fontFamily:DS.fonts.display,letterSpacing:1,textShadow:`0 0 20px ${t.preview}`}}>SAMPLE TEXT</div>
              <div style={{position:"absolute",top:8,right:8,fontSize:10,color:DS.colors.textMuted}}>{t.uses} uses</div>
            </div>
            <div style={{padding:14}}>
              <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:4}}>{t.name}</div>
              <div style={{fontSize:11,color:DS.colors.textMuted,marginBottom:12,lineHeight:1.5}}>{t.desc}</div>
              <Btn variant="accent" size="sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>showToast(`✅ "${t.name}" template applied!`)}>Apply Template</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// AUTH PAGE
// ============================================================
function AuthPage({onAuth}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  return(
    <div style={{minHeight:"100vh",background:DS.colors.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      {/* Background effects */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% -20%,rgba(99,255,180,0.08),transparent)"}}/>
      <div style={{position:"absolute",top:"20%",left:"10%",width:300,height:300,borderRadius:"50%",background:"rgba(99,255,180,0.03)",filter:"blur(60px)"}}/>
      <div style={{position:"absolute",bottom:"20%",right:"10%",width:300,height:300,borderRadius:"50%",background:"rgba(77,159,255,0.03)",filter:"blur(60px)"}}/>
      <div style={{width:"100%",maxWidth:420,padding:24,animation:"fadeUp 0.5s ease",position:"relative"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#63ffb4,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#000",fontFamily:DS.fonts.display,margin:"0 auto 16px"}}>CF</div>
          <div style={{fontFamily:DS.fonts.display,fontSize:36,letterSpacing:3,color:"#fff"}}>CLIPFORGE</div>
          <div style={{fontSize:13,color:DS.colors.textMuted,marginTop:4,letterSpacing:1}}>AI-POWERED VIDEO STUDIO</div>
        </div>
        <Card style={{padding:28}}>
          <div style={{display:"flex",gap:0,marginBottom:24,background:DS.colors.surfaceHigh,borderRadius:10,padding:3}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:mode===m?"linear-gradient(135deg,#63ffb4,#00d4ff)":"transparent",color:mode===m?"#000":"rgba(255,255,255,0.4)",fontWeight:700,fontSize:12,cursor:"pointer",textTransform:"capitalize",transition:"all 0.2s ease"}}>{m==="login"?"Sign In":"Create Account"}</button>
            ))}
          </div>
          {/* Google login */}
          <button onClick={onAuth} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px solid ${DS.colors.border}`,background:DS.colors.surfaceHigh,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16,transition:"all 0.2s ease"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(99,255,180,0.3)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.colors.border;}}>
            <span style={{fontSize:18}}>G</span> Continue with Google
          </button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{flex:1,height:1,background:DS.colors.border}}/>
            <span style={{fontSize:11,color:DS.colors.textMuted}}>or</span>
            <div style={{flex:1,height:1,background:DS.colors.border}}/>
          </div>
          <div style={{marginBottom:12}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
              style={{width:"100%",background:DS.colors.surfaceHigh,border:`1px solid ${DS.colors.border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:13,marginBottom:10}}/>
            <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password"
              style={{width:"100%",background:DS.colors.surfaceHigh,border:`1px solid ${DS.colors.border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:13}}/>
          </div>
          <button onClick={onAuth} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#63ffb4,#00d4ff)",color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",transition:"all 0.2s ease",letterSpacing:0.3}}
            onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.1)";}}
            onMouseLeave={e=>{e.currentTarget.style.filter="";}}>
            {mode==="login"?"Sign In to ClipForge →":"Create Free Account →"}
          </button>
          <div style={{textAlign:"center",marginTop:14,fontSize:11,color:DS.colors.textMuted}}>
            100% Free · No credit card · No watermark
          </div>
        </Card>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:DS.colors.textMuted}}>
          Join 50,000+ creators using ClipForge to go viral
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App(){
  const [authed,setAuthed]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const [collapsed,setCollapsed]=useState(false);

  const showToast=(msg)=>{setToast(msg);};
  const clearToast=()=>setToast(null);

  const pages={
    dashboard:<Dashboard setPage={setPage} showToast={showToast}/>,
    upload:<Upload setPage={setPage} showToast={showToast}/>,
    clips:<Clips showToast={showToast}/>,
    captions:<CaptionStudio showToast={showToast}/>,
    growth:<GrowthEngine showToast={showToast}/>,
    scheduler:<Scheduler showToast={showToast}/>,
    analytics:<Analytics/>,
    templates:<Templates showToast={showToast}/>,
    platforms:<PlatformsPage showToast={showToast}/>,
    settings:<Settings showToast={showToast}/>,
  };

  if(!authed) return(
    <>
      <style>{GLOBAL_CSS}</style>
      <AuthPage onAuth={()=>setAuthed(true)}/>
    </>
  );

  return(
    <>
      <style>{GLOBAL_CSS}</style>
      {toast&&<Toast msg={toast} onClose={clearToast}/>}
      <div style={{display:"flex",minHeight:"100vh",background:DS.colors.bg}}>
        <Sidebar page={page} setPage={setPage} collapsed={collapsed}/>
        <div style={{flex:1,overflow:"auto"}}>
          {/* Top navbar */}
          <div style={{position:"sticky",top:0,background:"rgba(5,5,8,0.9)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${DS.colors.border}`,padding:"12px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:100}}>
            <button onClick={()=>setCollapsed(c=>!c)} style={{background:"none",border:`1px solid ${DS.colors.border}`,borderRadius:8,padding:"6px 10px",color:DS.colors.textMuted,cursor:"pointer",fontSize:14}}>
              {collapsed?"→":"←"}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <WaveAnim active={false}/>
              <div style={{background:DS.colors.accentDim,border:`1px solid rgba(99,255,180,0.2)`,color:DS.colors.accent,borderRadius:99,padding:"5px 14px",fontSize:11,fontWeight:700}}>
                ✨ All Systems Online
              </div>
              <Btn variant="primary" size="sm" onClick={()=>setPage("upload")} icon="⚡">New Clip</Btn>
            </div>
          </div>
          <main style={{padding:28}}>
            {pages[page]||<Dashboard setPage={setPage} showToast={showToast}/>}
          </main>
        </div>
      </div>
    </>
  );
}
