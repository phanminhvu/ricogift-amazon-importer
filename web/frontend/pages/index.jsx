import {
    Card,
    Page,
    Form, FormLayout, Checkbox, TextField, Button,
    TextContainer,
    Image,
    Stack,
    Layout,
    Link,
    Text,
} from "@shopify/polaris";
import {TitleBar, useAppBridge} from "@shopify/app-bridge-react";
import {useTranslation, Trans} from "react-i18next";
import {useCallback, useEffect, useState} from "react";
import './index.css';

import {trophyImage} from "../assets";

import {ProductsCard} from "../components";
import {PairingCard} from "../components/PairingCard.jsx";

export default function HomePage() {
    const shopify = useAppBridge();
    const {t} = useTranslation();
    const [newsletter, setNewsletter] = useState(false);
    const [isPairing, setIsPairing] = useState(false);
    const [keyboaradChecked, setKeyboardChecked] = useState(false);

    const [computerChecked, setComputerChecked] = useState(false);
    const [budget, setBudget] = useState(0);
    const [email, setEmail] = useState('');
    const [pairCollection, setPairCollection] = useState([]);
    const [pairData, setPairData] = useState([]);

    const handleSubmit = useCallback(async () => {
        setIsPairing(true);
        try {
            const response = await fetch("/api/products/pair", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    budget: budget,
                    keyboaradChecked: keyboaradChecked,
                    computerChecked: computerChecked,
                }),
            });

            const responseData = await response.json();

            if (response.ok) {
                const pairCollection = responseData?.data?.map((item, index) => ({
                    index: index,
                    budget: item.budget,
                    totalPrice: item.totalPrice,
                    remaining: item.remaining,
                }))
                const pairData = responseData?.data?.map((item, index) => ({
                    index: index,
                    combination: item.combination,
                }))

                setPairCollection(pairCollection);
                setPairData(pairData);

                shopify.toast.show("Pairing successful!");
            } else {
                shopify.toast.show(responseData.error, {
                    isError: true,
                });
            }
        } catch (error) {
            shopify.toast.show("An error occurred", {
                isError: true,
            });
        }
        setIsPairing(false);
    }, [keyboaradChecked, computerChecked, budget, email]);


    return (
        <Page narrowWidth>
            <TitleBar title={t("HomePage.title")}/>
            <Layout>
                <Layout.Section>
                    <Card sectioned>
                            <Form onSubmit={handleSubmit}>
                                <FormLayout>
                                    <TextField
                                        label="Budget"
                                        type="number"
                                        value={budget}
                                        onChange={setBudget}
                                        autoComplete="off"
                                    />


                                    <Checkbox
                                        label="Keyboards"
                                        checked={keyboaradChecked}
                                        onChange={setKeyboardChecked}

                                    />

                                    <Checkbox
                                        label="Computers"
                                        checked={computerChecked}
                                        onChange={setComputerChecked}
                                    />

                                    <Button submit loading={isPairing}>Submit</Button>
                                </FormLayout>
                            </Form>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <PairingCard pairCollection={pairCollection} pairData={pairData}/>
                </Layout.Section>
                <Layout.Section>
                    <ProductsCard/>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
