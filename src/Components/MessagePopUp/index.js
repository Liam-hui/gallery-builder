import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import {Services} from '../../services';

const MessagePopUp = () => {

  const overlay = useSelector(state => state.overlay);

  useEffect(() => {
    // if(overlay.mode=='uploadFail') setMessage('上傳失敗');
    // else if(overlay.mode=='saveFail') setMessage('儲存失敗');
    // else if(overlay.mode=='saveSuccess') setMessage('儲存成功');
  }, [overlay]);

  return (
    <div className='overlayBox' style={{width:340,height:200}} >

      <div style={{fontSize:27,marginBottom:30}}>{overlay.message}</div>

      <div style={{display:'flex'}}>
        <div className='clickable borderBox overlayButton' 
          onClick={()=>{
            if(overlay.confirm) overlay.confirm();
            else store.dispatch({type:'CLOSE_OVERLAY'});
          }}>
          {overlay.confirmText?overlay.confirmText:'確定'}
        </div>

        {overlay.cancel?
          <div className='clickable borderBox overlayButton' 
            onClick={()=>{
              store.dispatch({type:'CLOSE_OVERLAY'});
            }}>
            取消
          </div>
        :null}
        
      </div>

    </div>
  );
}

export default MessagePopUp;





