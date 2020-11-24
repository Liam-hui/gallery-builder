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

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

function App() {

  // let query = useQuery();
  const status = useSelector(state => state.status);
  const display = useSelector(state => state.display);
  const screen = useSelector(state => state.screen);

  useEffect(() => {
    initScreen();

    const mode = window.mode;
    const product_id = window.product_id;
    const order_id = window.order_id;

    console.log(mode,product_id,order_id);

    if(mode=='admin') Services.adminGetAlbumPhotos(product_id);
    else if (mode=='user') Services.userGetPhotos(order_id,product_id);

    store.dispatch({type:'SET_STATUS',status:{mode:mode,product_id:product_id,order_id:order_id}});
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

  let className = '';
  if(isMobile) className += ' isMobile'; else className += ' isDesktop';
  className += ( ' ' + display);

  return (
    <div className={"appContainer"+className} style={{height:screen.screenHeight}}>

      {status.mode=='user' && (screen.screenWidth>768 || screen.screenHeight<screen.screenWidth)?  <IconsList/>:null}
      {status.mode=='admin' && screen.screenWidth<768 && screen.screenHeight<768 && screen.screenHeight<screen.screenWidth?  <ImagesList/>:null}
      
      <div style={{flex:1}} className='ColumnRevContainer'>
        {display!='smallLand'?(
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

    </div>

  );
}

export default App;