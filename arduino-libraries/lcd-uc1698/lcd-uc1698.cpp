//=======================================Copyright (c)==================================================
//                                ANDORIN OptoElec Tech INC.
//                             HomePage http://www.andorin.com
//                             BBS  http://www.lcd-module.com.cn
//======================================================================================================
//Software:     uc1698.c
//Description:  lcd controller
//Device:
//======================================================================================================
// Created By:      ARIN
// Created date:    2008-12-10
// Version: 1.0
//======================================================================================================
// Modified by:
// Modified date:
// Version:
//======================================================================================================
#include "lcd-uc1698.h"

//============================================================
// ÉèÖÃÖ¸Áî¼Ä´æÆ÷
//============================================================

void Uc1698_SetReg(char cdata)         /* Command write routine */
{
    RstIo0(CS);
    RstIo0(A0);
    WriteBus(cdata);
    SetIo0(A0);
//  Delay(200);
    SetIo0(CS);
}
void Uc1698_WriteData(char pdata)        /* Data write (1 byte) routine */
{
    RstIo0(CS);
    SetIo0(A0);
    WriteBus(pdata);
//  Delayms(5);
    SetIo0(CS);
}
void SetWindows(int x,int y,int w,int h)
{

     Uc1698_SetReg(UC1698_SetWC0);      //wpc0:column
     Uc1698_SetReg(x);              //start from 130
     Uc1698_SetReg(UC1698_SetWC1);      //wpc1
     Uc1698_SetReg(x+w);                //end:272

     Uc1698_SetReg(UC1698_SetWR0);      //wpp0:row
     Uc1698_SetReg(y);              //start from 0
     Uc1698_SetReg(UC1698_SetWR1);      //wpp1
     Uc1698_SetReg(y+h);                //end 160
}

/////////////////////LCD³õÊ¼»¯//////////////////////////
void Uc1698_Init(void)
{
    RstIo0(RST);
    OSTimeDly(OS_TICKS_PER_SEC/5);
    SetIo0(RST);
    OSTimeDly(OS_TICKS_PER_SEC/5);

 Uc1698_SetReg(UC1698_SetRST);      //reset by command
 Delayms(10);
#if 0
 /*power control*/
 Uc1698_SetReg(UC1698_SetBR+1);     //Bias Ratio:0:5,1:10,2:11,3:12
 Uc1698_SetReg(UC1698_SetPM);       //electronic potentionmeter
 Uc1698_SetReg(255);
 Uc1698_SetReg(UC1698_SetDE+0x06);  //display enable

 Uc1698_SetReg(UC1698_SetPC+UC1698_LcdCapLarge+UC1698_VlcdInter);   //power control set as internal power
 Uc1698_SetReg(UC1698_SetTC+UC1698_TC05);   //set temperate compensation as 0%

 /*display control*/
 Uc1698_SetReg(UC1698_SetAPO+1);    //all pixel on
 Uc1698_SetReg(UC1698_SetINV+0);    //inverse display off

 /*lcd control*/
 Uc1698_SetReg(UC1698_SetMAP);      //MX & MY disable
 Uc1698_SetReg(UC1698_SetLR+0x03);  //line rate 15.2klps
 Uc1698_SetReg(UC1698_SetCP+1);     //rgb-rgb
 Uc1698_SetReg(UC1698_SetCM+1);     //4k color mode
 Uc1698_SetReg(UC1698_SetPDC+0);    //12:partial display control disable


 /*n-line inversion*/
 Uc1698_SetReg(UC1698_SetNIV);
 Uc1698_SetReg(0x10);               //enable NIV

 /*com scan fuction*/
 Uc1698_SetReg(UC1698_SetCS+0x02);  //enable FRC,disable PWM,LRM

 /*window*/
 Uc1698_SetReg(UC1698_SetWC0);      //wpc0:column
 Uc1698_SetReg(0x25);               //start from 130
 Uc1698_SetReg(UC1698_SetWC1);      //wpc1
 Uc1698_SetReg(0x5A);               //end:272

 Uc1698_SetReg(UC1698_SetWR0);      //wpp0:row
 Uc1698_SetReg(0x00);               //start from 0
 Uc1698_SetReg(UC1698_SetWR1);      //wpp1
 Uc1698_SetReg(0x9F);               //end 160

 Uc1698_SetReg(UC1698_SetWMODE);    //inside mode

 Uc1698_SetReg(UC1698_SetRAC+1);    //RAM control

 Uc1698_SetReg(UC1698_SetDE+0x02);  //display on,select on/off mode.Green Enhance mode disable

 /*scroll line*/
 Uc1698_SetReg(UC1698_SetSLL+0);    //low bit of scroll line
 Uc1698_SetReg(UC1698_SetSLM+0);    //high bit of scroll line
 Uc1698_SetReg(UC1698_SetMAP+0x04); //enable MY.enable FLT and FLB
 Uc1698_SetReg(UC1698_SetFL);       //14:FLT,FLB set
 Uc1698_SetReg(0x00);

 /*partial display*/
 Uc1698_SetReg(UC1698_SetPDC);      //12,set partial display control:off
 Uc1698_SetReg(UC1698_SetCEND);     //com end
 Uc1698_SetReg(0x9f);               //160
 Uc1698_SetReg(UC1698_SetDST);      //display start
 Uc1698_SetReg(0);                  //0
 Uc1698_SetReg(UC1698_SetDEND);     //display end
 Uc1698_SetReg(159);                //160

#endif

#if 1
 /*power control*/
 Uc1698_SetReg(UC1698_SetBR+1);     //Bias Ratio:0:5,1:10,2:11,3:12
 Uc1698_SetReg(UC1698_SetPM);       //electronic potentionmeter
 Uc1698_SetReg(224);
// Uc1698_SetReg(UC1698_SetDE+0x06);    //display enable

 Uc1698_SetReg(UC1698_SetPC+UC1698_LcdCapLarge+UC1698_VlcdInter);   //power control set as internal power
 Uc1698_SetReg(UC1698_SetTC+UC1698_TC05);   //set temperate compensation as 0%



 /*display control*/
// Uc1698_SetReg(UC1698_SetAPO+0);  //all pixel on
// Uc1698_SetReg(UC1698_SetINV+0);  //inverse display off


 /*lcd control*/
 Uc1698_SetReg(UC1698_SetMAP+0x04);     //MX & MY disable
// Uc1698_SetReg(UC1698_SetLR+0x03);    //line rate 15.2klps
 Uc1698_SetReg(UC1698_SetCP+1);     //rgb-rgb
 Uc1698_SetReg(UC1698_SetCM+1);     //4k color mode
// Uc1698_SetReg(UC1698_SetPDC+0);  //12:partial display control disable


 /*n-line inversion*/
// Uc1698_SetReg(UC1698_SetNIV);
// Uc1698_SetReg(0x10);             //enable NIV

 /*com scan fuction*/
// Uc1698_SetReg(UC1698_SetCS+0x02);    //enable FRC,disable PWM,LRM

 /*window*/
// Uc1698_SetReg(UC1698_SetWC0);        //wpc0:column
// Uc1698_SetReg(0x25);             //start from 112
// Uc1698_SetReg(UC1698_SetWC1);        //wpc1
// Uc1698_SetReg(0x5A);             //end:272

// Uc1698_SetReg(UC1698_SetWR0);        //wpp0:row
// Uc1698_SetReg(0x00);             //start from 0
// Uc1698_SetReg(UC1698_SetWR1);        //wpp1
// Uc1698_SetReg(0x9F);             //end 160

// Uc1698_SetReg(UC1698_SetWMODE);  //inside mode

// Uc1698_SetReg(UC1698_SetRAC+1);  //RAM control
 Uc1698_SetReg(UC1698_SetDE+0x07);  //display on,select on/off mode.Green Enhance mode disable

 SetWindows(0x25,0,0x35,160);
 /*scroll line*/
// Uc1698_SetReg(UC1698_SetSLL+0);  //low bit of scroll line
// Uc1698_SetReg(UC1698_SetSLM+0);  //high bit of scroll line
// Uc1698_SetReg(UC1698_SetMAP+0x04);   //enable MY.enable FLT and FLB
// Uc1698_SetReg(UC1698_SetFL);     //14:FLT,FLB set
// Uc1698_SetReg(0x00);

 /*partial display*/
// Uc1698_SetReg(UC1698_SetPDC);        //set partial display control:off
// Uc1698_SetReg(UC1698_SetCEND);       //com end
// Uc1698_SetReg(0x9f);             //160
// Uc1698_SetReg(UC1698_SetDST);        //display starting com
// Uc1698_SetReg(0);                    //0
// Uc1698_SetReg(UC1698_SetDEND);       //display ending com
// Uc1698_SetReg(159);              //160
#endif


}

void Uc1698_Update()
{
int i,j;
char pdata;

     Uc1698_SetReg(UC1698_SetCAL+0x05);
     Uc1698_SetReg(UC1698_SetCAM+0x02);
     Uc1698_SetReg(UC1698_SetRAL+0x00);
     Uc1698_SetReg(UC1698_SetRAM+0x00);

    for(j=0;j<160;j++)
    {
//      SetWindows(0x26,j,0x36,160);
        for(i=0;i<160/8;i++)
        {
            pdata=0;
            if(vram[j][i] & 0x80)
                pdata=0xf0;
            if(vram[j][i] & 0x40)
                pdata|=0x0f;
            Uc1698_WriteData(pdata);

            pdata=0;
            if(vram[j][i] & 0x20)
                pdata=0xf0;
            if(vram[j][i] & 0x10)
                pdata|=0x0f;
            Uc1698_WriteData(pdata);

            pdata=0;
            if(vram[j][i] & 0x08)
                pdata=0xf0;
            if(vram[j][i] & 0x04)
                pdata|=0x0f;
            Uc1698_WriteData(pdata);

            pdata=0;
            if(vram[j][i] & 0x02)
                pdata=0xf0;
            if(vram[j][i] & 0x01)
                pdata|=0x0f;
            Uc1698_WriteData(pdata);
        }
        Uc1698_WriteData(0);
    }
}