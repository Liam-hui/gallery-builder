import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTimes} from '@fortawesome/free-solid-svg-icons'
import {isMobile} from 'react-device-detect';

let WIDTH = 200;
let HEIGHT = 100;

function Slider() {
  if(isMobile) {
    WIDTH = 100;
  }

  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);

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
    return(
      <div className={imageSelected==image.id?"sliderImageWrapper selected":"sliderImageWrapper"} style={{width:WIDTH,height:HEIGHT}}>
        <div className='sliderImage' style={{width:width,height:height}}>
          <img src={image.url} style={{width:'100%',height:'100%'}} onClick={()=>store.dispatch({type:'SELECT_IMAGE',id:image.id})}/>
          <div className='deleteIcon' onClick={()=>{
            if(imageSelected==image.id) {
              let index = images.findIndex(image => image.id == imageSelected);
              if(index<images.length-1) index += 1;
              else index -= 1;
              if(index==-1)  store.dispatch({type:'SELECT_IMAGE',id: -1});
              else store.dispatch({type:'SELECT_IMAGE',id:images[index].id});
            }
            store.dispatch({type:'DELETE_IMAGE',id:image.id});
          }}>
            {/* <FontAwesomeIcon style={{height:15,width:15,opacity:0.7}} icon={faTimes} color={'white'} /> */}
          </div>
        </div>
        {isMobile?null:(
          <div className="editing">
            <div className="editingBox">
              圖片編輯中
            </div>
          </div>
        )}
      </div>
    )
  });

  return (
    <div className="sliderContainer">
      <div className="sliderImagesContainer">
        {imagesList}
      </div>
    </div>
  );
}

export default Slider;
