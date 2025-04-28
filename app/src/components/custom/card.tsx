import React from "react";
import styled from "styled-components";

const Card = () => {

  return (
    <StyledWrapper>
      <div className="container noselect">
        <div className="canvas">
          {[...Array(25)].map((_, i) => (
            <div key={i} className={`tracker tr-${i + 1}`} />
          ))}
          <div id="card">
            {/* <p id="prompt">HOVER OVER :D</p> */}
            <div className="title">
              look mom,
              <br />
              no JS
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Works janky on mobile :< */
  .container {
    position: relative;
    width: 190px;
    height: 254px;
    transition: 200ms;
  }
  
  .container:active {
    width: 180px;
    height: 245px;
  }

  #card {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    transition: 700ms;
    background: #202938;
    border: 2px solid transparent; /* Initial transparent border */
  }

  #card:hover {
    border: 2px solid white; /* White border on hover */
  }

  .title {
    opacity: 0;
    transition: 300ms ease-in-out;
    transition-delay: 100ms;
    position: absolute;
    font-size: x-large;
    font-weight: bold;
    color: white;
  }

  .tracker:hover ~ #card .title {
    opacity: 1;
  }

  #prompt {
    bottom: 8px;
    left: 12px;
    z-index: 20;
    font-size: 20px;
    font-weight: bold;
    transition: 300ms ease-in-out;
    position: absolute;
    max-width: 110px;
    color: rgb(255, 255, 255);
  }

  .tracker {
    position: absolute;
    z-index: 200;
    width: 100%;
    height: 100%;
  }

  .tracker:hover {
    cursor: pointer;
  }

  .tracker:hover ~ #card #prompt {
    opacity: 0;
  }

  .tracker:hover ~ #card {
    transition: 300ms;
    filter: brightness(1.1);
  }

  .container:hover #card::before {
    transition: 200ms;
    content: "";
    opacity: 80%;
  }

  .canvas {
    perspective: 800px;
    inset: 0;
    z-index: 200;
    position: absolute;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-template-areas:
      "tr-1 tr-2 tr-3 tr-4 tr-5"
      "tr-6 tr-7 tr-8 tr-9 tr-10"
      "tr-11 tr-12 tr-13 tr-14 tr-15"
      "tr-16 tr-17 tr-18 tr-19 tr-20"
      "tr-21 tr-22 tr-23 tr-24 tr-25";
  }

  #card::before {
    content: "";
    background: #202938;
    filter: blur(2rem);
    opacity: 30%;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    transition: 200ms;
    border: 2px solid;
  }

  /* Grid areas */
  ${[...Array(25)].map(
    (_, i) => `
      .tr-${i + 1} { grid-area: tr-${i + 1}; }
    `
  )}

  /* Rotation effects */
  .tr-1:hover ~ #card { transform: rotateX(20deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-2:hover ~ #card { transform: rotateX(20deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-3:hover ~ #card { transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg); }
  .tr-4:hover ~ #card { transform: rotateX(20deg) rotateY(5deg) rotateZ(0deg); }
  .tr-5:hover ~ #card { transform: rotateX(20deg) rotateY(10deg) rotateZ(0deg); }
  
  .tr-6:hover ~ #card { transform: rotateX(10deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-7:hover ~ #card { transform: rotateX(10deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-8:hover ~ #card { transform: rotateX(10deg) rotateY(0deg) rotateZ(0deg); }
  .tr-9:hover ~ #card { transform: rotateX(10deg) rotateY(5deg) rotateZ(0deg); }
  .tr-10:hover ~ #card { transform: rotateX(10deg) rotateY(10deg) rotateZ(0deg); }

  .tr-11:hover ~ #card { transform: rotateX(0deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-12:hover ~ #card { transform: rotateX(0deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-13:hover ~ #card { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  .tr-14:hover ~ #card { transform: rotateX(0deg) rotateY(5deg) rotateZ(0deg); }
  .tr-15:hover ~ #card { transform: rotateX(0deg) rotateY(10deg) rotateZ(0deg); }

  .tr-16:hover ~ #card { transform: rotateX(-10deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-17:hover ~ #card { transform: rotateX(-10deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-18:hover ~ #card { transform: rotateX(-10deg) rotateY(0deg) rotateZ(0deg); }
  .tr-19:hover ~ #card { transform: rotateX(-10deg) rotateY(5deg) rotateZ(0deg); }
  .tr-20:hover ~ #card { transform: rotateX(-10deg) rotateY(10deg) rotateZ(0deg); }

  .tr-21:hover ~ #card { transform: rotateX(-20deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-22:hover ~ #card { transform: rotateX(-20deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-23:hover ~ #card { transform: rotateX(-20deg) rotateY(0deg) rotateZ(0deg); }
  .tr-24:hover ~ #card { transform: rotateX(-20deg) rotateY(5deg) rotateZ(0deg); }
  .tr-25:hover ~ #card { transform: rotateX(-20deg) rotateY(10deg) rotateZ(0deg); }

  /* Disable text selection */
  .noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`;

export default Card;
