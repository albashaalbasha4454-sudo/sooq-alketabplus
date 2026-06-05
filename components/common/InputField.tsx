import React from 'react';

type Props={id?:string;label:string;value:string;onChange:any;error?:string;type?:string;placeholder?:string;required?:boolean;disabled?:boolean;className?:string};

const InputField:React.FC<Props>=({id,label,value,onChange,error,type='text',placeholder,required,disabled,className})=>{
  const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{try{onChange(e)}catch{onChange(e.target.value)}};
  return <div className="mb-4"><label htmlFor={id} className="block text-slate-700 text-sm font-bold mb-2">{label}</label><input type={type} id={id} value={value} onChange={handleChange} placeholder