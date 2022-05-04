import "./about.css";
import Award from "../../img/bracathon.png";
import Me from "../../img/me.png";

const About = () => {
  return (
    <div className="a">
      <div className="a-left">
        <div className="a-card bg"></div>
        <div className="a-card">
          <img src={Me} alt="" className="a-img" />
        </div>
      </div>
      <div className="a-right">
        <h1 className="a-title">About Me</h1>
        <p className="a-sub">
          My academic and internship have helped me develop an analytical and
          logical approach to work, software skills, and work under pressure.
        </p>
        <p className="a-desc">
          As a dedicated problem solver, I display an expert skill in JavaScript
          and supporting libraries/frameworks like ReactJS, ExpressJs, and
          NodeJs that solve real-world problems through code. During my
          internship, I have gained hands-on experience in industry-standard
          development, which I'm looking to apply to a growing business like
          amazon.
        </p>
        <div className="a-award">
          <img src={Award} alt="" className="a-award-img" />
          <div className="a-award-texts">
            <h4 className="a-award-title">Finalist, Bracathon 2019</h4>
            <p className="a-award-desc">
              We created an Android app to track students' regular attendance
              and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
