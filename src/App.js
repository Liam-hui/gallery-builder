import './App.css';
import './animate.css';
import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import store from './store';
import {isMobile} from 'react-device-detect';
import { useLocation} from "react-router-dom";

import Editor from './Components/Editor';
import ImagesList from './Components/ImagesList';
import IconsList from './Components/IconsList';

import {Services} from './services';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App() {

  let query = useQuery();
  const status = useSelector(state => state.status);
  const mode = useSelector(state => state.mode);
  const display = useSelector(state => state.display);
  const screen = useSelector(state => state.screen);

  useEffect(() => {
    initScreen();

    let mode = query.get('mode');
    if (mode==null) mode = 'admin';

    if(mode=='admin') Services.adminGetAlbumPhotos(5898975314070);
    else if (mode=='user') Services.userGetPhotos('d8f5ca96-a092-4250-a8fa-1dc1b96b22d4',5898975314070);

    store.dispatch({type:'SELECT_MODE',mode:mode});
    store.dispatch({type:'SET_STATUS',status:{product_id:5898975314070}});
  }, []);

  //execute when resizing finish
  let resizeLoop;
  window.addEventListener("resize", ()=>{
    clearTimeout(resizeLoop);
    resizeLoop = setTimeout(doneResizing, 500);
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

  return (
    <div className={isMobile? "appContainer isMobile":"appContainer isDesktop"} style={{height:screen.screenHeight}}>

      {mode=='user' && (screen.screenWidth>768 || screen.screenHeight<screen.screenWidth)?  <IconsList/>:null}
      {mode=='admin' && screen.screenWidth<768 && screen.screenHeight<768 && screen.screenHeight<screen.screenWidth?  <ImagesList/>:null}
      
      <div style={{flex:1}} className='ColumnRevContainer'>
        {display!='smallLand'?(
          <div className="bottomRow">
            {mode=='user'?
              <>
                {screen.screenWidth>768? <ImagesList/>:<IconsList/>}
              </>
              :<ImagesList/>
            }
          </div>
        ):null} 
        <Editor/>
      </div>

    </div>

  );
}

export default App;