<%@ WebHandler Language="C#" Class="api" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Web;
using Newtonsoft.Json;

public class api : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        Uri url = context.Request.Url;
        string domain = url.Scheme + "://" + url.Authority + "/schemas/";

        string folder = context.Server.MapPath("~/schemas/");        
        Uri root = new Uri(folder);
        
        var urls = from f in Directory.EnumerateFiles(folder, "*.json")
                   select domain + root.MakeRelativeUri(new Uri(f));
        
        var serializer = JsonSerializer.Create();
        serializer.Serialize(context.Response.Output, urls);

        SetHeaders(folder, context);
    }

    private static void SetHeaders(string folder, HttpContext context)
    {
        context.Response.ContentType = "text/plain";

        // Set cache dependencies on the schema files and this .ashx file
        context.Response.AddFileDependency(folder);
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