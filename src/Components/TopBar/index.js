import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";

import AddImage from '../../Components/AddImage';
import Icon from '@mdi/react'
import { mdiRedoVariant } from '@mdi/js';
import { mdiCloseThick } from '@mdi/js';

function TopBar(props) {
  const display = useSelector(state => state.display);
  const status = useSelector(state => state.status);
  
  const handleCloseApp = () => {
    if(status.demo||status.view)window.closeApp();
    else store.dispatch({type:'SET_OVERLAY',mode:'message',message:'離開前請儲存所有更改',cancel:true,confirm:window.closeApp,confirmText:'離開'});
  }

  return (
    <div className="topBarContainer">
      
      {props.editor?
      <>
        <div className={props.stepEnabled.back?'stepButton':'stepButton disabled'} onClick={props.back}>
          <Icon path={mdiRedoVariant} size={0.8} style={{transform:`scaleX(-1)`}} color="grey"/>
          復原
        </div>
        <div className={props.stepEnabled.redo?'stepButton':'stepButton disabled'} onClick={props.redo}>
          <Icon path={mdiRedoVariant} size={0.8} color="grey"/>
          重做
        </div>
      
        {display=='large'? null:<AddImage/>}

      </>
      :null}

      <div className="closeApp" style={props.view?{marginLeft:'auto',marginRight:8}:{}} onClick={handleCloseApp}>
        <Icon path={mdiCloseThick} size={0.8} color="black"/>
      </div>
    </div>
  );
}

export default TopBar;



