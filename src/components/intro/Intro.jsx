import "./intro.css";
// import Me from "../../img/Profile.png";

const Intro = () => {
  return (
    <div className="i">
      <div className="i-left">
        <div className="i-left-wrapper">
          <h2 className="i-intro">Hello, My name is</h2>
          <h1 className="i-name">Md. Zahid Hasan</h1>
          <div className="i-title">
            <div className="i-title-wrapper">
              <div className="i-title-item">Front-end Developer</div>
              <div className="i-title-item">UI Designer</div>
              <div className="i-title-item">Programmer</div>
              <div className="i-title-item">Blogger</div>
            </div>
          </div>
          <p className="i-desc">
            Usually, I spend my days playing with JavaScript; also experimenting
            with ReactJS and ExpressJS. 🤗
          </p>
          <div class="indicator"></div>
        </div>
      </div>
      <div className="i-right">
        <div className="i-bg"></div>
        {/* <img src={Me} alt="" className="i-img" /> */}
      </div>
    </div>
  );
};

export default Intro;
