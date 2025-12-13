import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    // https://prebuiltui.com/components/footer
    <div>
      <footer className="px-6 pt-8 md:px-16 lg:px-36 mt-30 w-full text-gray-300">
        <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
          <div className="md:max-w-96">
            <img onClick={ ()=> navigate('/')} alt="" className="w-36" src={assets.logo} />
            <p className="mt-6 text-sm">
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>

            
          </div>
          <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
            <div>
              <h2 className="font-semibold mb-5">Company</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/movies">Movies</a>
                </li>
                <li>
                  <a href="#">Theaters</a>
                </li>
                <li>
                  <a href="#">Releases</a>
                </li>

                <li>
                  <a href="/favorite">Favorite</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-5">Get in touch</h2>
              <div className="text-sm space-y-2">
                <p>+1-234-567-890</p>
                <p>contact@example.com</p>
              </div>
            </div>
          </div>
        </div>
        <p className="pt-4 text-center text-sm pb-5">
          Copyright {new Date().getFullYear()} ©{" "}
          <a href="https://prebuiltui.com">Nguyen</a>. All Right Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
