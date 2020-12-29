import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import {Services} from '../../services';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';


const InitPopUp = () => {

  const [text,setText] = useState('');

  return (
    <div className='overlayBox'>

      <div className="clickable overlayCloseButton" onClick={()=>store.dispatch({type:'CLOSE_OVERLAY'})}>
        <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.9} color="black"/>   
      </div>

      <div style={{width:200,marginBottom:30}}>
        <div style={{fontSize:18,marginBottom:10,marginLeft:3}}>請輸入名稱：</div>
        <textarea wrap="off" value={text} onChange={(event)=>setText(event.target.value)} className='initTextInput'/>
      </div>

      <div style={{display:'flex'}}>
        <div className='clickable borderBox overlayButton' 
          onClick={()=>{
            Services.userUpdateAllTitle(text);
            store.dispatch({type:'CLOSE_OVERLAY'});
          }}>
          確定
        </div>
      </div>
    </div>
  );
}

export default InitPopUp;





