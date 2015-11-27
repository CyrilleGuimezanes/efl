using System;
using System.Collections.Generic;
using System.Text;
using SHDocVw;
using mshtml;
using System.IO;
using Microsoft.Win32;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using System.Diagnostics;
using System.Reflection;
using System.Resources;
using ELSConnect;
using System.Drawing;
using System.Drawing.Imaging;

namespace BHO_HelloWorld
{

    [
    ComVisible(true),
    Guid("8a194578-81ea-4850-9911-13ba2d71efbd"),
    ClassInterface(ClassInterfaceType.None)
    ]
    public class BHO : IObjectWithSite
    {
        public string[] scripts = new string[] {
          Res.underscore,
          Res.jquery,
          Res.sha256,
          Res.iscroll,
          Res.backbone,
          Res.utils,
          Res.config,
          Res.models,
          Res.collection_result,
          Res.view_filter,
          Res.view_result,
          Res.view_widget,
          Res.widget_generator
        }
          
        ;
        SHDocVw.WebBrowser webBrowser;
        object site;

        public string ImageToBase64(Image image,
            System.Drawing.Imaging.ImageFormat format)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                // Convert Image to byte[]
                image.Save(ms, format);
                byte[] imageBytes = ms.ToArray();

                // Convert byte[] to Base64 String
                string base64String = Convert.ToBase64String(imageBytes);
                return base64String;
            }
        }
        public void OnDocumentComplete(object pDisp, ref object URL)
        {

            // @Eric Stob: Thanks for this hint!
            // This will prevent this method being executed more than once.
            if (pDisp != this.site)
                return;

            var document = webBrowser.Document as IHTMLDocument2;
            var window = document.parentWindow;

            string finalScript = "";
            string images = "{" +
                               //"'logo': '" + ImageToBase64(Res.logo, ImageFormat.Bmp) + "'," +
                               "'loader':'" + ImageToBase64(Res.loader, ImageFormat.Bmp) + "'," +
                               "'icon38':'" + ImageToBase64(Res.icon_38, ImageFormat.Bmp) + "'," +
                               "'open':'" + ImageToBase64(Res.open, ImageFormat.Bmp) + "'," +
                               "'close':'" + ImageToBase64(Res.close, ImageFormat.Bmp) + "'" +
                            "}";
            document.body.insertAdjacentHTML("afterBegin", Res.widget);

            var js = "window.ELS = {};window.ELS.images = " + images;
            window.execScript(@""+ js);

            IHTMLStyleSheet css = (IHTMLStyleSheet)document.createStyleSheet("", 0);
            css.cssText = Res.app;
            

            foreach (string script in scripts)
            {
                finalScript += script + " ";
            }
            try
            {
                window.execScript(@"" + finalScript);
            }
            catch(Exception)
            {
                MessageBox.Show("Une erreur, problablement Javascript, à été trouvée dans l'extension ELSConnect");
            }
            
            



        }

        public void OnBeforeNavigate2(object pDisp, ref object URL, ref object Flags, ref object TargetFrameName, ref object PostData, ref object Headers, ref bool Cancel)
        {
            if (pDisp != this.site)
                return;

        }



        #region BHO Internal Functions
        public static string BHOKEYNAME = "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Browser Helper Objects";

        [ComRegisterFunction]
        public static void RegisterBHO(Type type)
        {
            RegistryKey registryKey = Registry.LocalMachine.OpenSubKey(BHOKEYNAME, true);

            if (registryKey == null)
                registryKey = Registry.LocalMachine.CreateSubKey(BHOKEYNAME);

            string guid = type.GUID.ToString("B");
            RegistryKey ourKey = registryKey.OpenSubKey(guid);

            if (ourKey == null)
                ourKey = registryKey.CreateSubKey(guid);

            ourKey.SetValue("Alright", 1);
            registryKey.Close();
            ourKey.Close();
        }

        [ComUnregisterFunction]
        public static void UnregisterBHO(Type type)
        {
            RegistryKey registryKey = Registry.LocalMachine.OpenSubKey(BHOKEYNAME, true);
            string guid = type.GUID.ToString("B");

            if (registryKey != null)
                registryKey.DeleteSubKey(guid, false);
        }

        public int SetSite(object site)
        {
            #if DEBUG
                    Debugger.Launch();
            #endif
            if (site != null)
            {
                webBrowser = (SHDocVw.WebBrowser)site;
                webBrowser.DocumentComplete += new DWebBrowserEvents2_DocumentCompleteEventHandler(this.OnDocumentComplete);
                webBrowser.BeforeNavigate2 += new DWebBrowserEvents2_BeforeNavigate2EventHandler(this.OnBeforeNavigate2);
            }
            else
            {
                webBrowser.DocumentComplete -= new DWebBrowserEvents2_DocumentCompleteEventHandler(this.OnDocumentComplete);
                webBrowser.BeforeNavigate2 -= new DWebBrowserEvents2_BeforeNavigate2EventHandler(this.OnBeforeNavigate2);
                webBrowser = null;
            }
            this.site = site;
            return 0;

        }

        public int GetSite(ref Guid guid, out IntPtr ppvSite)
        {
            IntPtr punk = Marshal.GetIUnknownForObject(webBrowser);
            int hr = Marshal.QueryInterface(punk, ref guid, out ppvSite);
            Marshal.Release(punk);

            return hr;
        }





        #endregion


    }
}
