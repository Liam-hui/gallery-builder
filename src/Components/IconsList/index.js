import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import Slider from '../../Components/Slider';
import AddImage from '../../Components/AddImage';

function IconsList(props) {

  const screen = useSelector(state => state.screen);

  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);

  const icons = useSelector(state => state.icons);

  const image = () => {
    return images.find(image => image.id == imageSelected);
  }

  let WIDTH,HEIGHT;
  if(screen.screenWidth>768 && screen.screenHeight>768) {WIDTH=240;HEIGHT='100%';}
  else if (screen.screenHeight>screen.screenWidth) {WIDTH='100%';HEIGHT='100%'}
  else {WIDTH=150;HEIGHT='100%';}
  let containerStyle = {width:WIDTH,height:HEIGHT}

  return (
    <div className="iconsListContainer" style={containerStyle}>

      {screen.screenWidth<=768||screen.screenHeight<=768?null:<AddImage/>}

        <Slider vertical={screen.screenWidth>768 || screen.screenHeight<=screen.screenWidth?true:false} images={icons} canDelete={true} selectedId={image()?image().iconSelected:-1} selectedText={'已選擇'}
          selectItem={(id)=>{
            if(imageSelected!=-1) store.dispatch({type:'SELECT_ICON',iconId:id,id:imageSelected});
          }}
          deleteItem={(id)=>{
            if(!images.some(image=>image.iconSelected==id)) store.dispatch({type:'DELETE_ICON',id:id});
          }}
        />


    </div>
  );
}

export default IconsList;



