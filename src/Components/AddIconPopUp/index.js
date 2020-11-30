import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import {Services} from '../../services';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';

let image = null;

export const setIconPopUpImage = (base64) => {
  image=base64;
}

export const AddIconPopUp = () => {

  return (
    <div className='overlayBox'>

      {image==null?null:<div className='iconBig' style={{backgroundImage:'url('+image+')'}} />}

      <div className="overlayCloseButton" onClick={()=>store.dispatch({type:'CLOSE_OVERLAY'})}>
        <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.9} color="black"/>   
      </div>

      <div style={{display:'flex'}}>
        <div className='borderBox overlayButton' 
          onClick={()=>{
            store.dispatch({type:'CLOSE_OVERLAY'});
            Services.userUploadIcon({base64:image},1);
          }}>
          使用原圖
        </div>
        <div className='borderBox overlayButton'
          onClick={()=>{
            store.dispatch({type:'CLOSE_OVERLAY'});
            Services.userUploadIcon({base64:image},0);
          }}>
          去除背景
        </div>
      </div>
    </div>
  );
}





