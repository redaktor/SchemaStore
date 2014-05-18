<%@ WebHandler Language="C#" Class="api" %>

using System;
using System.IO;
using System.Web;

public class api : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        
        Uri url = context.Request.Url;
        string domain = url.Scheme + "://" + url.Authority + "/schemas/";
        
        string folder = context.Server.MapPath("~/schemas/");
        var files = Directory.EnumerateFiles(folder, "*.json", SearchOption.AllDirectories);
        Uri root = new Uri(folder);
            
        foreach (string file in files)
        {
            Uri absolute = new Uri(file);
            Uri relative = root.MakeRelativeUri(absolute);
            
            context.Response.Write(domain + relative + Environment.NewLine);    
        }
    }

    public bool IsReusable
    {
        get { return false; }
    }
}