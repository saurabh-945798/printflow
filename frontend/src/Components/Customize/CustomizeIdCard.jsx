import Customize from "./Customize.jsx";

/**

* CustomizeIdCard
* Handles the customization flow for ID card printing.
* Reuses the generic Customize component with the ID card category.
  */
  const CustomizeIdCard = () => {
  return <Customize categoryOverride="id-card" />;
  };

export default CustomizeIdCard;
