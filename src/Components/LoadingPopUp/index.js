import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import Loading from '../../Components/Loading';

const LoadingPopUp = () => {

  const overlay = useSelector(state => state.overlay);

  return (
    <div className='loadingPopUp'>
      {overlay.message!=null?
        <div className='loadingPopUpText'>{overlay.message}</div>
      :null}
      <div className='flexCenter' style={{width:80,height:80}}><Loading scale={0.6} /></div>
    </div>
  );
}

export default LoadingPopUp;





