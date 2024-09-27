import {
    Card,
    Page,
    Form, FormLayout, Checkbox, TextField, Button,
    TextContainer,
    Image,
    Stack,
    Layout,
    Link,
    Text, Frame, LegacyStack, Select, Icon,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import './index.css';
import {
    SettingsMinor,
    PlanMinor,
    ChatMajor,
    QuestionMarkInverseMajor, SearchMinor,
} from '@shopify/polaris-icons';
import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import { PairingCard } from "../components/PairingCard.jsx";

export default function HomePage() {
    const shopify = useAppBridge();
    const { t } = useTranslation();
    const [value, setValue] = useState('');

    const handleImport = async () => {
        const response = await fetch("/api/products", { method: "POST", body: JSON.stringify({ userName: "nhannt" }) });
        if (response.ok) {
            shopify.toast.show("OK");
        } else {
            shopify.toast.show("NOK");
        }
    };

    return (
        <Frame>
            <Page

                title="Products"
                secondaryActions={[
                    {
                        content: 'Settings',
                        icon: SettingsMinor,
                        onAction: () => console.log('Settings'),
                    },
                    {
                        content: 'Plan',
                        icon: PlanMinor,
                        onAction: () => console.log('Plan'),
                    },
                    {
                        content: 'Support',
                        icon: ChatMajor,
                        onAction: () => console.log('Support'),
                    },
                    {
                        content: 'FAQ',
                        icon: QuestionMarkInverseMajor,
                        onAction: () => console.log('FAQ'),
                    }
                ]}
            >
                <Layout>
                    <Layout.Section>
                        <Card sectioned title={'Import new product'}
                            actions={[
                                { content: 'Import by seller', onAction: () => console.log('Import') },
                                { content: 'Bulk Import', onAction: () => console.log('Bulk Import') }
                            ]}
                        >

                            <TextField
                                label="Amazon product link"
                                value={value}
                                autoComplete="off"
                                connectedRight={<Button primary size={'slim'} onClick={() => handleImport()}>Import</Button>}
                            />

                        </Card>
                        <Card sectioned title={'Products'}
                        >

                            <TextField
                                label=""
                                placeholder={'Search products by Title'}
                                value={value}
                                onChange={(newValue) => setValue(newValue)}
                                prefix={<Icon source={SearchMinor} color="inkLighter" />}
                            />

                        </Card>
                    </Layout.Section>

                </Layout>
            </Page>
        </Frame>
    );
}
