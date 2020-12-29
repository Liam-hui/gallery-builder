import './App.css';
import './animate.css';
import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import store from './store';
import {Services} from './services';
import {isMobile} from 'react-device-detect';

import Editor from './Components/Editor';
import Viewer from './Components/Viewer';
import ImagesList from './Components/ImagesList';
import IconsList from './Components/IconsList';
import InitPopUp from './Components/InitPopUp';
import LoadingPopUp from './Components/LoadingPopUp';
import TitleSetting from './Components/TitleSetting';
import TopBar from './Components/TopBar';

import MessagePopUp from './Components/MessagePopUp';
import {AddIconPopUp} from './Components/AddIconPopUp';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';

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

    store.dispatch({type:'SET_STATUS',status:{mode:mode,demo:demo,isFirst:window.isFirst==1?true:false,view:view,product_id:product_id,order_id:order_id,customer_id:customer_id}});
  
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
    if(!isMobile || Math.min(window.innerWidth,window.innerHeight)>600) display = 'large';
    else if(window.innerHeight>=window.innerWidth) display = 'smallPort';
    else display = 'smallLand';
    store.dispatch({type:'SET_DISPLAY',display:display});

  }

  let className = '';
  if(isMobile) className += ' isMobile'; else className += ' isDesktop';
  className += ( ' ' + display);
  if(display!='large') className += ' small';

  return (
    <div className={"appContainer"+className}>


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
          {display=='large'?

            <div className='ColumnRevContainer'>
              
              <div className="bottomRow">
                <ImagesList/>
              </div>
    
              <Viewer viewerMode={true}/>

            </div>

          :<Viewer scroll={true} viewerMode={true}/>}
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
              <LoadingPopUp/>
            </div>
          :null}

          {overlay.mode=='init'?
            <div className='overlayChildren'>
              <InitPopUp/>
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

      <div className="clickable closeApp" style={status.view?{marginLeft:'auto',marginRight:8}:{}} 
        onClick={ ()=>{
            if(status.demo||status.view)window.closeApp();
            else store.dispatch({type:'SET_OVERLAY',mode:'message',message:'離開前請儲存所有更改',cancel:true,confirm:window.closeApp,confirmText:'離開'});
          }}
      >
        <Icon path={mdiCloseThick} size={1} color="black"/>
      </div>

    </div>

    

  );
}

export default App;