import {useState} from 'react';

type Props={onLogin:()=>Promise<void>};
const W=import.meta.env.VITE_LOGIN_WORD||'admin';
const C=import.meta.env.VITE_LOGIN_CODE||'1234';

export default function LoginView({onLogin}:Props){
 const [w,setW]=useState('');
 const [c,setC]=useState('');
 const [e,setE]=useState('');
 function go(){if(w===W&&c===C)void onLogin();else setE('Invalid access');}
 return <main><h1>Sooq Alketab</h1><input value={w} onChange={x=>setW(x.target.value)} placeholder="word"/><input value={c} onChange={x=>setC(x.target.value)} placeholder="code"/><button onClick={go}>Login</button><p>{e}</p></main>;