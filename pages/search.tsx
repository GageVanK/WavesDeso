import { Search } from "@/components/Search";
import { Space, Container } from "@mantine/core";


export default function SearchPage() {

    return(
        <>
        <Space h="xl" />
        
        <Container size="sm">
            <Search close={null}/>
        </Container>
        </>
    )
}