import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import {Services} from '../../services';

const UploadFailPopUp = () => {

  return (
    <div className='overlayBox' style={{width:340,height:200}} onClick={()=>console.log('asdf')}>

      <div style={{fontSize:27,marginBottom:30}}>上傳失敗</div>

      <div className='borderBox overlayButton' 
        onClick={()=>{
          store.dispatch({type:'CLOSE_OVERLAY'});
        }}>
        確定
      </div>

    </div>
  );
}

export default UploadFailPopUp;





