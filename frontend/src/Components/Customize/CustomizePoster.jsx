import Customize from "./Customize.jsx";

/**

* CustomizePoster
* Handles customization flow for cup/poster printing.
* Uses the shared Customize component with category override.
  */
  const CustomizePoster = () => {
  return <Customize categoryOverride="cup" />;
  };

export default CustomizePoster;
