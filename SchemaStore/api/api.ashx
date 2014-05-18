<%@ WebHandler Language="C#" Class="api" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Web;

public class api : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {   
        Uri url = context.Request.Url;
        string domain = url.Scheme + "://" + url.Authority + "/schemas/";
        
        string folder = context.Server.MapPath("~/schemas/");
        var files = Directory.EnumerateFiles(folder, "*.json");
        Uri root = new Uri(folder);
            
        foreach (string file in files)
        {
            Uri absolute = new Uri(file);
            Uri relative = root.MakeRelativeUri(absolute);
            
            context.Response.Write(domain + relative + Environment.NewLine);    
        }

        SetHeaders(files, context);
    }

    private static void SetHeaders(IEnumerable<string> files, HttpContext context)
    {
        context.Response.ContentType = "text/plain";

        // Set cache dependencies on the schema files and this .ashx file
        context.Response.AddFileDependencies(files.ToArray());
        context.Response.AddFileDependency(context.Request.PhysicalPath);
        
        // Caches the response on both the server and client
        context.Response.Cache.SetValidUntilExpires(true);
        context.Response.Cache.SetExpires(DateTime.Now.AddDays(7));
        context.Response.Cache.SetCacheability(HttpCacheability.Public);
        context.Response.Cache.SetLastModifiedFromFileDependencies();
    }

    public bool IsReusable
    {
        get { return false; }
    }
}