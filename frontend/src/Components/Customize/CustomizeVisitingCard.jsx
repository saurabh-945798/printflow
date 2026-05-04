import Customize from "./Customize.jsx";

/**

* CustomizeVisitingCard
* Renders the customization page specifically for visiting cards.
* Uses the generic Customize component with a predefined category.
  */
  const CustomizeVisitingCard = () => {
  return <Customize categoryOverride="visiting-card" />;
  };

export default CustomizeVisitingCard;
