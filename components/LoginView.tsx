import {useState} from 'react';

type Props={onLogin:()=>Promise<void>};
const W=import.meta.env.VITE_LOGIN_WORD||'admin';
const C=import.meta.env.VITE_LOGIN_CODE||'1234';

export default function LoginView({onLogin}:Props){
 const [w,setW]=useState('');
 const [c,setC]=useState('');
 const [e,setE]=useState('');
 function go(){if(w===W&&c===C)void onLogin();else setE('Invalid access');}
 return <main><h1>Sooq Alketab</h