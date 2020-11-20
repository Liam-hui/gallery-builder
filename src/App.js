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

const temp_images = [
  {
    url:'https://cdn.cjr.org/wp-content/uploads/2019/07/AdobeStock_100000042-e1563305717660-686x371.jpeg',
    width:686,
    height:371,
    id:0,
    placeHolder:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
      scale:0.23930968360498564
    },
    textBox:{
      width:300,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:40,
    }
  },
  {
    url:'https://www.geeklawblog.com/wp-content/uploads/sites/528/2018/12/liprofile-656x369.png',
    width:656,
    height:369,
    id:1,
    placeHolder:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
      scale:0.23930968360498564
    },
    textBox:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
    }
  },
  {
    url:'https://png.pngtree.com/thumb_back/fh260/background/20190828/pngtree-dark-vector-abstract-background-image_302715.jpg',
    width:555,
    height:260,
    id:2,
    placeHolder:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
      scale:0.23930968360498564
    },
    textBox:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
    }
  },
  {
    url:'https://www.incimages.com/uploaded_files/image/1920x1080/westworld-2-hbo-background-1920_419617.jpg',
    width:1920,
    height:1080,
    id:3,
    placeHolder:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
      scale:0.23930968360498564
    },
    textBox:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
    }
  },
  {
    url:'https://cdn.cjr.org/wp-content/uploads/2019/07/AdobeStock_100000042-e1563305717660-686x371.jpeg',
    width:686,
    height:371,
    id:4,
    placeHolder:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
      scale:0.23930968360498564
    },
    textBox:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
    }
  },
  {
    url:'https://www.incimages.com/uploaded_files/image/1920x1080/westworld-2-hbo-background-1920_419617.jpg',
    width:1920,
    height:1080,
    id:5,
    placeHolder:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
      scale:0.23930968360498564
    },
    textBox:{
      width:350,
      height:350,
      x:273.07046979865777,
      y:209.530201342281885,
      rot:0,
    }
  },
]

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App() {

  let query = useQuery();
  const mode = useSelector(state => state.mode);
  const display = useSelector(state => state.display);
  const screen = useSelector(state => state.screen);

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

  useEffect(() => {
    initScreen();

    let mode = query.get('mode');
    if (mode==null) mode = 'admin';

    store.dispatch({type:'SELECT_MODE',mode:mode});
    store.dispatch({type:'SET_IMAGES',images:temp_images});
  }, []);

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