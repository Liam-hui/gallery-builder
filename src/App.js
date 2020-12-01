import './App.css';
import './animate.css';
import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import store from './store';
import {Services} from './services';
import {isMobile} from 'react-device-detect';

import Editor from './Components/Editor';
import ImagesList from './Components/ImagesList';
import IconsList from './Components/IconsList';
import Loading from './Components/Loading';
import TitleSetting from './Components/TitleSetting';

import UploadFailPopUp from './Components/UploadFailPopUp';
import {AddIconPopUp} from './Components/AddIconPopUp';

function App() {

  const overlay = useSelector(state => state.overlay);
  const status = useSelector(state => state.status);
  const display = useSelector(state => state.display);
  const screen = useSelector(state => state.screen);

  useEffect(() => {
    initScreen();

    let mode = window.mode;
    let demo = false;
    const customer_id = window.customer_id;
    const product_id = window.product_id;
    const order_id = window.order_id;

    if(mode=='admin') Services.adminGetAlbumPhotos(product_id);
    else if (mode=='user') Services.userGetPhotos(order_id,product_id);
    else if (mode=='demo') {
      Services.userGetPhotos(order_id,product_id,true);
      mode = 'user';
      demo = true;
    }

    store.dispatch({type:'SET_STATUS',status:{mode:mode,demo:demo,product_id:product_id,order_id:order_id,customer_id:customer_id}});
  }, []);

  //execute when resizing finish
  let resizeLoop;
  window.addEventListener("resize", ()=>{
    if(!isMobile){
      clearTimeout(resizeLoop);
      resizeLoop = setTimeout(doneResizing, 500);
    }
  });
  function doneResizing(){
    initScreen();
  }

  const initScreen = () => {
    store.dispatch({type:'SET_SCREEN',screenWidth:window.innerWidth,screenHeight:window.innerHeight,orientation:window.matchMedia("(orientation: portrait)")? 'landscape':'portrait'});
    
    let display;
    if(window.innerWidth>768||window.innerHeight>768) display = 'large';
    else if(window.innerHeight>=window.innerWidth) display = 'smallPort';
    else display = 'smallLand';
    store.dispatch({type:'SET_DISPLAY',display:display});
  }

  let className = '';
  if(isMobile) className += ' isMobile'; else className += ' isDesktop';
  className += ( ' ' + display);

  return (
    <div className={"appContainer"+className} style={{height:screen.screenHeight}}>

      {status.mode=='user' && (screen.screenWidth>768 || screen.screenHeight<screen.screenWidth)?  <IconsList/>:null}
      {status.mode=='admin' && screen.screenWidth<768 && screen.screenHeight<768 && screen.screenHeight<screen.screenWidth?  <ImagesList/>:null}
      
      <div style={{flex:1}} className='ColumnRevContainer'>
        {display!='smallLand'&&!status.demo?(
          <div className="bottomRow">
            {status.mode=='user'?
              <>
                {screen.screenWidth>768? <ImagesList/>:<IconsList/>}
              </>
              :<ImagesList/>
            }
          </div>
        ):null} 
        <Editor/>
      </div>

      {overlay.on!='off'?
        <div className={overlay.on!='hidden'?'overlay':'overlay hidden'}>

          {overlay.mode=='loading'?
            <div className='overlayChildren'>
              <div className='loading'>
                <Loading scale={0.6} />
              </div>
            </div>
          :null}

          {overlay.mode=='uploadIcon'?
            <div className='overlayChildren'>
              <AddIconPopUp/>
            </div>
          :null}

          {overlay.mode=='uploadFail'?
            <div className='overlayChildren'>
              <UploadFailPopUp/>
            </div>
          :null}

          {overlay.mode=='titleSetting'?
            <div className='overlayChildren'>
              <TitleSetting on={overlay.mode=='titleSetting'}/>
            </div>
          :null}

        </div>
      :null}

    </div>

    

  );
}

export default App;