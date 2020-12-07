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

import MessagePopUp from './Components/MessagePopUp';
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
    let view = false;
    const customer_id = window.customer_id;
    const product_id = window.product_id;
    const order_id = window.order_id;

    if(mode=='admin') Services.adminGetAlbumPhotos(product_id);
    else if (mode=='user') Services.userGetPhotos(order_id,product_id);
    else if (mode=='demo') {
      Services.demoGetPhoto(product_id);
      mode = 'user';
      demo = true;
    }
    else if (mode=='view') {
      Services.userGetPhotos(order_id,product_id);
      mode = 'user';
      view = true;
    }

    store.dispatch({type:'SET_STATUS',status:{mode:mode,demo:demo,view:view,product_id:product_id,order_id:order_id,customer_id:customer_id}});
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


      {status.mode=='user' && !status.demo && !status.view ?
        <>
          {display=='large'||display=='smallLand'?<IconsList/>:null}

          <div className='ColumnRevContainer'>
        
            {display!='smallLand'?(
              <div className="bottomRow">
                {display=='large'?<ImagesList/>:<IconsList/>}
              </div>
            ):null} 
    
            <Editor/>
          </div>
        </>
      :null}

      {status.mode=='user' && status.demo? 
        <>
          {display=='large'||display=='smallLand'?<IconsList/>:null}

          <div className='ColumnRevContainer'>
        
            {display=='smallPort'?(
              <div className="bottomRow">
                <IconsList/>
              </div>
            ):null} 
    
            <Editor/>
          </div>
        </>
      :null}

      {status.mode=='user' && status.view? 
        <>
          {display=='smallLand'?<ImagesList/>:null}

          <div className='ColumnRevContainer'>
        
            {display!='smallLand'?(
              <div className="bottomRow">
                <ImagesList/>
              </div>
            ):null} 
    
            <Editor/>
          </div>
        </>
      :null}

      {status.mode=='admin'? 
        <>
          {display=='smallLand'?<ImagesList/>:null}

          <div className='ColumnRevContainer'>
        
            {display!='smallLand'?(
              <div className="bottomRow">
                <ImagesList/>
              </div>
            ):null} 
    
            <Editor/>
          </div>
        </>
      :null}

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

          {overlay.mode=='message'?
            <div className='overlayChildren'>
              <MessagePopUp/>
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