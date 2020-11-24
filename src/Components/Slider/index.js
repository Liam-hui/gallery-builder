import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';

import Icon from '@mdi/react'
import { mdiCloseThick } from '@mdi/js';


function Slider(props) {

  const status = useSelector(state => state.status);
  const screen = useSelector(state => state.screen);

  const {vertical,images,selectedId,selectedText,selectItem,deleteItem,canDelete,border} = props;

  const [highlighted,setHighlighted] = useState(-1);

  let WIDTH,HEIGHT;
  if(screen.screenWidth>768 || screen.screenHeight>768) {
    if(vertical) {WIDTH=150;HEIGHT=100;}
    else {WIDTH=200;HEIGHT=100;}
  }
  else {
    if(vertical) {WIDTH=100;HEIGHT=100;}
    else {WIDTH=100;HEIGHT=100;}
  }
 
  const imagesList = images.map((image,index) => {
    let ratio = image.width / image.height;
    let width;
    let height;
    if(ratio>WIDTH/HEIGHT){
      width=WIDTH;
      height=WIDTH/ratio;
    }
    else {
      height=HEIGHT;
      width=HEIGHT*ratio;
    }
    let className = '';
    if(selectedId==image.id) className += ' selected';
    if(highlighted==image.id) className += ' pressed';
    if(border) className += ' border';
    
    return(
      <div className={"sliderImageWrapper"+className} style={{ width:WIDTH, height:HEIGHT, "--slider-image-width": WIDTH+'px', "--slider-image-height": HEIGHT+'px' }}>
        <div className='sliderImage' style={{width:width,height:height}}>
          <img src={image.url} style={{width:'100%',height:'100%'}} onClick={isMobile? ()=>{if(highlighted==image.id) setHighlighted(-1); else setHighlighted(image.id)}:()=>selectItem(image.id)} 
            onMouseLeave={(e)=>{
              if(e.relatedTarget.className!='deleteButtonClickArea' && e.relatedTarget.className!='chooseButtonClickArea') setHighlighted(-1);
            }
          }/>
          
          {canDelete&&!isMobile?(
            <div className='deleteButton' onClick={()=>{deleteItem(image.id);}}>
              <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`}} size={0.8} color="#DDDDDD"/>
            </div>
          ):null}
        </div>

        <div className="statusWrapper">
          <div className="statusWrapperBox">
            {selectedText}
          </div>
        </div>

        {canDelete&&isMobile?(
          <div className="deleteButtonClickArea" onClick={()=>{if(highlighted==image.id)deleteItem(image.id)}}>
            <div className='deleteButton'>
              <Icon path={mdiCloseThick} style={{transform:`translate(0.5px,0.5px)`,pointerEvents:'none'}} size={0.8} color="#CCCCCC"/>
            </div>
          </div>
        ):null}

        <div className="chooseButtonWrapper">
          <div className="chooseButtonClickArea" onClick={()=>{if(highlighted==image.id)selectItem(image.id)}}>
            <div className="chooseButton">
              {selectedId==image.id?'取消':'選擇'}
            </div>
          </div>
        </div>

      </div>
    )
  });

  const isAdmin = status.mode=='admin'? ' isAdmin':'';
  const isVertical = vertical? ' vertical':'';

  return (
    <div className={"sliderContainer"+isVertical+isAdmin}>
      
      <div className="sliderScrollContainer">
        {imagesList}
      </div>
    </div>
  );
}

export default Slider;
