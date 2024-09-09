import {useEffect, useState} from "react";
import {Card, TextContainer, Text, OptionList, Grid, Layout, List} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

export function PairingCard( {pairData, pairCollection} ) {
    const [selected, setSelected] = useState([0]);


    useEffect(() => {
      console.log(selected);
    }, [selected]);



  return (

      <Grid>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
        <Card
            title="Pairing Collection"
            sectioned
        >
            <OptionList
                onChange={setSelected}
                options={
                    pairCollection.map((item) => ({
                        value: item.index,
                        label: `Total Price: ${item.totalPrice}$, Remaining: ${item.remaining}$`
                    }))
               }
                selected={selected}
            />
        </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
          <Card
              title="Pairing Items"
              sectioned
          >

                <List>
                    {pairData[selected]?.combination.map((item) => (
                        <List.Item key={item.id}>
                            <TextContainer>
                                <Text>
                                    {item.name} - {item.type} - {item.price}$
                                </Text>
                            </TextContainer>
                        </List.Item>
                    ))}

                </List>
          </Card>
          </Grid.Cell>
      </Grid>

  );
}
