import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";

import AddImage from '../../Components/AddImage';
import Icon from '@mdi/react'
import { mdiRedoVariant } from '@mdi/js';

function TopBar(props) {
  const display = useSelector(state => state.display);

  return (
    <div className="topBarContainer">
      
      {props.editor?
      <>
        <div className={props.stepEnabled.back?'clickable stepButton':'stepButton disabled'} onClick={props.back}>
          <Icon path={mdiRedoVariant} size={0.8} style={{transform:`scaleX(-1)`}} color="grey"/>
          復原
        </div>
        <div className={props.stepEnabled.redo?'clickable stepButton':'stepButton disabled'} onClick={props.redo}>
          <Icon path={mdiRedoVariant} size={0.8} color="grey"/>
          重做
        </div>
      
        {display=='large'? null:<AddImage/>}

      </>
      :null}

      <div className="fakeCloseApp" style={props.view?{marginLeft:'auto',marginRight:8}:{}}>
      </div>
    </div>
  );
}

export default TopBar;



