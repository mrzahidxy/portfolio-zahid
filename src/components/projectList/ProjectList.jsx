import "./projectList.css";
import Product from "../project/Project";
import { projects } from "../../data";

const ProductList = () => {
  return (
    <div className="pl">
      <div className="pl-texts">
        <h1 className="pl-title">Imagine and Create.</h1>
        <p className="pl-desc">
          Here are some of my works. For live view, Click on the below sections.
        </p>
      </div>

      <div className="pl-list">
        {projects.map((item) => (
          <Product key={item.id} img={item.img} link={item.link} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
