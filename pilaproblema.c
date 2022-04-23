#include <stdio.h>
struct pila
{
    char arreglo[30];
    int top;
};
int estallena(struct pila*);
int estavacia(struct pila*);
void meter(struct pila*,char);
char sacar(struct pila*);
int menu(void);
void main(void)
{
   struct pila S,*miptr1;
   miptr1=&S;
   int opc=0;
   char midato;
   do
   {
    opc=menu();
    switch (opc)
    {
    case 1:
    if(estallena(miptr1))
    {
      printf("Esta llena\n");
    }
    else 
    {
        printf("Ingrese el dato\n");
        scanf("%s",&midato);
        meter(miptr1,midato);
    }
        break;
    case 2:
    if (estavacia(miptr1))
    {
        printf("\nEsta vacia");
    }
    else
    {
        printf("\nEl dato recuperado es:%s",sacar(miptr1));
    }
        break;
    default:
        break;
    }

   } while (opc!=3);  
}
int estallena(struct pila*ptr1)
{
    if (ptr1->top==29)
    {
        printf("Esta vacia\n");
        return 1;
    }
    else
    return 0;  
}
int estavacia(struct pila*ptr1)
{
    if (ptr1->top==-1)
    {
        printf("Esta vacia\n");
        return 1;
    }
    else
    return 0; 
}
void meter(struct pila*ptr1,char dato)
{
    ptr1->arreglo[ptr1->top]=dato;
    ptr1->top++;
}
char sacar(struct pila*ptr1)
{
    char dato;
    dato=ptr1->arreglo[ptr1->top];
    ptr1->top--;
    return dato;
}
int menu(void)
{
    int opc;
    printf("\nBienvenido seleccione una opcion:");
    printf("\nPara meter 1");
    printf("\nPara sacar 2");
    printf("\nPara salir 3\n");
    scanf("%d",&opc);
    return opc;
}


