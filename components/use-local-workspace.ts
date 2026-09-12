'use client';
import {useEffect,useState} from 'react';
import {emptyWorkspace,validateWorkspace,WORKSPACE_KEY} from '@/lib/workspace.mjs';
import type {LocalWorkspace} from '@/lib/types';

export default function useLocalWorkspace(){
  const [workspace,setWorkspace]=useState<LocalWorkspace>(()=>emptyWorkspace());
  const [ready,setReady]=useState(false);
  const [error,setError]=useState(false);
  useEffect(()=>{
    try{const raw=localStorage.getItem(WORKSPACE_KEY);if(raw)setWorkspace(validateWorkspace(JSON.parse(raw)) as LocalWorkspace);}catch{setError(true);}
    setReady(true);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    try{localStorage.setItem(WORKSPACE_KEY,JSON.stringify(workspace));}catch{setError(true);}
  },[workspace,ready]);
  return {workspace,setWorkspace,ready,error};
}
