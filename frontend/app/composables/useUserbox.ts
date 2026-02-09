const isUserOpen = ref<boolean>(false);
const { maxZindex } = useChatbox();
export function useUserbox(){

    function openUserbox(): void{
        isUserOpen.value = true;
    }

    function closeUserbox(): void{
        isUserOpen.value = false;
    }

    function putOnTop(): number{
        return maxZindex() + 1;
    }

    return{
        isUserOpen,
        openUserbox,
        closeUserbox,
        putOnTop
    }

}