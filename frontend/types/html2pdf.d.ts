declare module "html2pdf.js" {
  interface Options {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, any>;
    jsPDF?: Record<string, any>;
    pagebreak?: Record<string, any>;
  }

  interface Html2PdfWorker {
    set(opt: Options): Html2PdfWorker;
    from(element: HTMLElement | string): Html2PdfWorker;
    save(): Promise<void>;
    output(type: string, opt?: any): Promise<any>;
    then(fn: (pdf: any) => void): Html2PdfWorker;
    catch(fn: (err: any) => void): Html2PdfWorker;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: HTMLElement, opt?: Options): Html2PdfWorker;

  export = html2pdf;
}
