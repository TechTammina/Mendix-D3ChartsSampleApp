# Mendix-D3ChartsSampleApp
D3 charts generated using Mendix TechTamminaDThree widget
D3 Charts Widget Documentation
1.	Download Tammina D3Charts widget from app store into the project.

2.	Create two entities as shown in the image. The attributes in the Report entity are calculated values.

 ![Alt text](/images/Entities.png?raw=true "Optional Title")

##### Note: The attribute names can be different
 
3.	The GenerateData entity  attributes are as follows :   

* `value :` The field name which is to be reported in chart.
* `xaxis :` Another field value which is to be reported in chart ,if required ,otherwise give  some 	default value.
* `caption:` The field name which is to be reported in chart.

4.	The Report entity attributes Values, Captions and XcoOrdinte are calculated by using microflows as shown below. The value which is present in these attributes is as follows:
* `Values:` Combination of all the data present in value attribute of GenerateData entity separated by ~.
* `Captions:` Combination of all the data present in caption attribute of GenerateData entity separated by ~.
* `XcoOrdinte:` Combination of all the data present in xaxis attribute of GenerateData entity separated by ~.

##### Note : The delimiter  must be ~.

 ![Alt text](/images/Microflow.png?raw=true "Optional Title")

5.	For displaying chart, place the widget under a dataview and select proper settings mapping the Report entity and selecting attributes.

 ![Alt text](/images/Widget.png?raw=true "Optional Title")
 
6.Download this sample app and run it in modeler to view the charts.

