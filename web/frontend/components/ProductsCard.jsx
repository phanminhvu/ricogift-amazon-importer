import { useState } from "react";
import {Card, TextContainer, Text, List} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

export function ProductsCard() {
  const shopify = useAppBridge();
  const { t } = useTranslation();
  const [isPopulating, setIsPopulating] = useState(false);
  const [isLoadingKeyboard, setIsLoadingKeyboard] = useState(false);
    const [isLoadingComputer, setIsLoadingComputer] = useState(false);
  const productsCount = 5;

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
  } = useQuery({
    queryKey: ["productCount"],
    queryFn: async () => {
      const response = await fetch("/api/products/count");
      return await response.json();
    },
    refetchOnWindowFocus: false,
  });

  const {
    data : keyboards,
    refetch: refetchKeyboards,
    isLoading: isLoadingKeyboards,
  } = useQuery({
    queryKey: ["keyboards"],
    queryFn: async () => {
      const response = await fetch("/api/products/keyboards");
      return await response.json();
    },
    refetchOnWindowFocus: false,
  });

    const {
    data : computers,
    refetch: refetchComputers,
    isLoading: isLoadingComputers,
    } = useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const response = await fetch("/api/products/computers");
      return await response.json();
    },
    }
    );




  // const handlePopulate = async () => {
  //   setPopulating(true);
  //   const response = await fetch("/api/products", { method: "POST" });
  //
  //   if (response.ok) {
  //     await refetchKeyboards();
  //
  //     shopify.toast.show(
  //       t("ProductsCard.productsCreatedToast", { count: productsCount })
  //     );
  //   } else {
  //     shopify.toast.show(t("ProductsCard.errorCreatingProductsToast"), {
  //       isError: true,
  //     });
  //   }
  //
  //   setPopulating(false);
  // };


  const handleAddKeyboards = async () => {
    setIsLoadingKeyboard(true);
    const response = await fetch("/api/products/keyboards", { method: "POST" });

    if (response.ok) {
      await refetchKeyboards();

      shopify.toast.show(
          t("ProductsCard.productsCreatedToast", { count: productsCount })
      );
    } else {
      shopify.toast.show(t("ProductsCard.errorCreatingProductsToast"), {
        isError: true,
      });
    }

    setIsLoadingKeyboard(false);
  };


  const handleAddComputers = async () => {
    setIsLoadingComputer(true);
    const response = await fetch("/api/products/computers", { method: "POST" });

    if (response.ok) {
      await refetchComputers();

      shopify.toast.show(
          t("ProductsCard.productsCreatedToast", { count: productsCount })
      );
    } else {
      shopify.toast.show(t("ProductsCard.errorCreatingProductsToast"), {
        isError: true,
      });
    }

    setIsLoadingComputer(false);
  };



  return (
      <div>
        <Card
            title="Keyboards"
            sectioned
            primaryFooterAction={{
              content: "Add keyboard",
              onAction: handleAddKeyboards,
              loading: isLoadingKeyboard,
            }}
        >
          <div style={{maxHeight: '300px', overflowY: 'scroll'}}>

            <List>
              {keyboards?.data.map((keyboard) => <List.Item>{`${keyboard.name} - ${keyboard.price}$`}</List.Item>)}


            </List>
          </div>
        </Card>
        <Card
            title="Computer"
            sectioned
            primaryFooterAction={{
              content: "Add computer",
              onAction: handleAddComputers,
              loading: isLoadingComputer,
            }}
        >
          <div style={{maxHeight: '300px', overflowY: 'scroll'}}>

            <List>
              {computers?.data.map((computer) => <List.Item>{`${computer.name} - ${computer.price}$`}</List.Item>)}
            </List>
          </div>
        </Card>
      </div>

);
}
