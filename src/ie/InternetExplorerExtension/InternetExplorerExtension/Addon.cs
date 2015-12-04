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
using System.Drawing;
using System.Drawing.Imaging;
using ELSConnectPOC;

namespace BHO_ELS
{

    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)]
    [Guid("9A194579-81EA-4851-9911-13BA2D71EFBE")]
    [ProgId("ELS.Connect")]
    public class Addon : IObjectWithSite, IOleCommandTarget
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
        IWebBrowser2 browser;
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
            var domain = URL.ToString();
            var document = browser.Document as IHTMLDocument2;
            var window = document.parentWindow;

            window.execScript(@"console.log('ELS: Document completed domaine: "+ domain + "')");
            if (domain.Contains("https://www.google") || domain.Contains("http://www.bing.com") || domain.Contains("http://search.yahoo"))
            {
                
            
                string finalScript = "";
                string images = "{" +
                                   //"'logo': '" + ImageToBase64(Res.logo, ImageFormat.Bmp) + "'," +
                                   "'loader':'" + ImageToBase64(Res.loader, ImageFormat.Bmp) + "'," +
                                   "'icon-38':'" + ImageToBase64(Res.icon_38, ImageFormat.Bmp) + "'," +
                                   "'open':'" + ImageToBase64(Res.open, ImageFormat.Bmp) + "'," +
                                   "'close':'" + ImageToBase64(Res.close, ImageFormat.Bmp) + "'" +
                                "}";
                window.execScript(@"console.log('ELS: HTML include: " + domain + "')");
                document.body.insertAdjacentHTML("afterBegin", Res.widget);

                var js = "window.ELS = {};window.ELS.images = " + images;
                window.execScript(@"" + js);
                window.execScript(@"console.log('ELS: JS included: " + domain + "')");
                IHTMLStyleSheet css = (IHTMLStyleSheet)document.createStyleSheet("", 0);
                css.cssText = Res.app;
                window.execScript(@"console.log('ELS: CSS include: " + domain + "')");

                foreach (string script in scripts)
                {
                    finalScript += script + " ";
                }
                try
                {
                    window.execScript(@"" + finalScript);
                }
                catch (Exception)
                {
                    window.execScript(@"console.log('ELS: Error on JS')");
                    MessageBox.Show("Une erreur, problablement Javascript, à été trouvée dans l'extension ELSConnect");
                }
            }

        }

        public void OnBeforeNavigate2(object pDisp, ref object URL, ref object Flags, ref object TargetFrameName, ref object PostData, ref object Headers, ref bool Cancel)
        {
            if (pDisp != this.site)
                return;

        }

        #region Implementation of IOleCommandTarget
        int IOleCommandTarget.QueryStatus(IntPtr pguidCmdGroup, uint cCmds, ref OLECMD prgCmds, IntPtr pCmdText)
        {
            return 0;
        }
        int IOleCommandTarget.Exec(IntPtr pguidCmdGroup, uint nCmdID, uint nCmdexecopt, IntPtr pvaIn, IntPtr pvaOut)
        {
            try
            {
                // Accessing the document from the command-bar.
                var document = browser.Document as IHTMLDocument2;
                var window = document.parentWindow;
                
                var form = new OptionsForm();
                if (form.ShowDialog() != DialogResult.Cancel)
                {
                    window.execScript(@"alert('Hihihi that work!');");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }

            return 0;
        }
        #endregion

        #region BHO Internal Functions
        public static string RegBHO = "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Browser Helper Objects";
        public static string RegCmd = "Software\\Microsoft\\Internet Explorer\\Extensions";

        [ComRegisterFunction]
        public static void RegisterBHO(Type type)
        {

            string guid = type.GUID.ToString("B");
            // BHO
            {
                
                RegistryKey registryKey = Registry.LocalMachine.OpenSubKey(RegBHO, true);
                if (registryKey == null)
                    registryKey = Registry.LocalMachine.CreateSubKey(RegBHO);
                RegistryKey key = registryKey.OpenSubKey(guid);
                if (key == null)
                    key = registryKey.CreateSubKey(guid);
                key.SetValue("Alright", 1);
                registryKey.Close();
                key.Close();
            }

            // Command
            {
                RegistryKey registryKey = Registry.LocalMachine.OpenSubKey(RegCmd, true);
                if (registryKey == null)
                    registryKey = Registry.LocalMachine.CreateSubKey(RegCmd);
                RegistryKey key = registryKey.OpenSubKey(guid);
                if (key == null)
                    key = registryKey.CreateSubKey(guid);
                key.SetValue("ButtonText", "ELS Connect");
                key.SetValue("CLSID", "{1FBA04EF-3023-11d2-8F1F-0000F87ABD16}");
                key.SetValue("ClsidExtension", guid);
                key.SetValue("Icon", "ELSConnect.dll/Resources/icon.ico,0");
                key.SetValue("HotIcon", "ELSConnect.dll/Resources/icon.ico,0");
                key.SetValue("Default Visible", "Yes");
                key.SetValue("MenuText", "&ELS Connect options");
                key.SetValue("ToolTip", "ELS Connect options");
                //key.SetValue("KeyPath", "no");
                registryKey.Close();
                key.Close();
            }


        }

        [ComUnregisterFunction]
        public static void UnregisterBHO(Type type)
        {
            string guid = type.GUID.ToString("B");
            // BHO
            {
                RegistryKey registryKey = Registry.LocalMachine.OpenSubKey(RegBHO, true);
                if (registryKey != null)
                    registryKey.DeleteSubKey(guid, false);

            }
            // Command
            {
                RegistryKey registryKey = Registry.LocalMachine.OpenSubKey(RegCmd, true);
                if (registryKey != null)
                    registryKey.DeleteSubKey(guid, false);

            }
        }
        [Guid("6D5140C1-7436-11CE-8034-00AA006009FA")]
        [InterfaceType(1)]
        public interface IServiceProvider
        {
            int QueryService(ref Guid guidService, ref Guid riid, out IntPtr ppvObject);
        }
        public int SetSite(object site)
        {

#if DEBUG
            Debugger.Launch();
#endif
            /*RegistryKey registryKey = Registry.LocalMachine.OpenSubKey(RegBHO, true);
            string[] todelete = new string[] { "8A194578-81EA-4850-9911-13BA2D71EFBD", "9A194578-81EA-4850-9911-13BA2D71EFBE", "B30C654D-7C51-4EB3-95B2-1E23905C2A3E", "D30C654D-7C51-4EB3-95B2-1E23905C2A3E" };
            for (int i = 0; i < todelete.Length; i++)
                registryKey.DeleteSubKey(todelete[i], false);*/


            this.site = site;

            if (site != null)
            {
                var serviceProv = (IServiceProvider)this.site;
                var guidIWebBrowserApp = Marshal.GenerateGuidForType(typeof(IWebBrowserApp)); // new Guid("0002DF05-0000-0000-C000-000000000046");
                var guidIWebBrowser2 = Marshal.GenerateGuidForType(typeof(IWebBrowser2)); // new Guid("D30C1661-CDAF-11D0-8A3E-00C04FC9E26E");
                IntPtr intPtr;
                serviceProv.QueryService(ref guidIWebBrowserApp, ref guidIWebBrowser2, out intPtr);

                browser = (IWebBrowser2)Marshal.GetObjectForIUnknown(intPtr);

                ((DWebBrowserEvents2_Event)browser).DocumentComplete +=
                    new DWebBrowserEvents2_DocumentCompleteEventHandler(this.OnDocumentComplete);
            }
            else
            {
                ((DWebBrowserEvents2_Event)browser).DocumentComplete -=
                    new DWebBrowserEvents2_DocumentCompleteEventHandler(this.OnDocumentComplete);
                //browser = null;
            }
            return 0;

        }

        public int GetSite(ref Guid guid, out IntPtr ppvSite)
        {
            IntPtr punk = Marshal.GetIUnknownForObject(browser);
            int hr = Marshal.QueryInterface(punk, ref guid, out ppvSite);
            Marshal.Release(punk);

            return hr;
        }





        #endregion


    }
}
