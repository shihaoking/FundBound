# -*- coding: utf8 -*-
import urllib2, codecs, json, time, datetime, cookielib

cacheStockBond = ""
cacheGqzy = ""
cookie = cookielib.CookieJar()

loadStockInfoFromCache = False

def downLoadJSONFromUrl(url, decode='utf-8'):
    req = urllib2.Request(url)
    req.add_header("Accept", "application/json, text/javascript, */*; q=0.01")
    req.add_header("Content-Type", "text/html; charset=utf-8")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36")

    try:
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookie))
        fd = opener.open(req).read()
        return fd.decode(decode)
    except Exception, e:
        if url.find('stock.xueqiu.com') > -1:
            downLoadJSONFromUrl("http://www.xueqiu.com/")
            return downLoadJSONFromUrl(url)

def getStockBondPage():
    t = time.time()
    url = "https://www.jisilu.cn/data/cbnew/cb_list/?___jsl=LST___t=" + str(int(t))
    return downLoadJSONFromUrl(url)


def getStockPage(stock_code):
    url = "https://stock.xueqiu.com/v5/stock/quote.json?symbol=" + stock_code
    return downLoadJSONFromUrl(url)

def getGqzyPage(stock_code):
    url = "http://data.eastmoney.com/DataCenter_V3/gpzy/chart.aspx?t=1&scode=" + stock_code
    return downLoadJSONFromUrl(url, 'gb2312')

def getStockBondList():
    result = getStockBondPage()
    jsonResult = json.loads(result)
    stockList = jsonResult['rows']
    return stockList


def getStockInfo(stock_code):
    if loadStockInfoFromCache == False:
        result = getStockPage(stock_code)
        jsonResult = json.loads(result)
        stockInfo = jsonResult['data']['quote']
        return stockInfo
    else:
        result = getStockCache()
        jsonResult = json.loads(result)
        for item in jsonResult:
            if item[u'stock_id'] == stock_code:
                return item

    return {}

def getStockCache():
    global cacheStockBond
    if cacheStockBond == "":
        fp = codecs.open("mock/stockinfo/bond_infos_cache.json", 'r', 'utf-8')
        cacheStockBond = fp.read()
    
    # print '---Load From Cache---'
    return cacheStockBond

def getGqzyInfo(stock_code):
    if loadStockInfoFromCache == False:
        result = getGqzyPage(stock_code[2:])
        jsonResult = json.loads(result)
        gqzyInfo = jsonResult['MoreData']
        return gqzyInfo
    else:

        global cacheGqzy
        if cacheGqzy == "":
            fp = codecs.open("mock/stockinfo/bond_infos_cache.json", 'r', 'utf-8')
            cacheGqzy = fp.read()
        
        jsonResult = json.loads(cacheGqzy)
        for item in jsonResult:
            if item[u'stock_id'] == stock_code:
                return item[u'gqzy_list']
    
    return []

def getStockBondInfo(stockBondInfoJson):
    stockBondInfo = stockBondInfoJson['cell']

    #过滤特殊债券
    if stockBondInfo['qflag'] == 'Q' or stockBondInfo['redeem_price_ratio'] is None:
        return None

    newStockBondInfo = {}
    newStockBondInfo[u'bond_id'] = stockBondInfo['bond_id']
    newStockBondInfo[u'bond_nm'] = stockBondInfo['bond_nm']
    newStockBondInfo[u'stock_id'] = stockBondInfo['stock_id']
    newStockBondInfo[u'market'] = stockBondInfo['stock_id'][0:2]
    newStockBondInfo[u'stock_nm'] = stockBondInfo['stock_nm']
    sincrease_rt = stockBondInfo['sincrease_rt']

    if sincrease_rt == u'停牌':
        newStockBondInfo[u'sincrease_rt'] = 0.00
    else:
        newStockBondInfo[u'sincrease_rt'] = round(float(stockBondInfo['sincrease_rt'].replace('%', '')), 2) #股票涨跌幅

    newStockBondInfo[u'price_tips'] = stockBondInfo['price_tips']

    newStockBondInfo[u'price'] = float(stockBondInfo['price'])
    newStockBondInfo[u'premium_rt'] = round(float(stockBondInfo['premium_rt'].replace('%', '')), 2) #溢价率
    newStockBondInfo[u'increase_rt'] = round(float(stockBondInfo['increase_rt'].replace('%', '')), 2) #转债涨跌幅
    newStockBondInfo[u'adj_scnt'] = int(stockBondInfo['adj_scnt'])  #已下调次数
    newStockBondInfo[u'adj_cnt'] = int(stockBondInfo['adj_cnt'])  #预计下调次数
    
    newStockBondInfo[u'convert_price'] = float(stockBondInfo['convert_price']) #转股价
    newStockBondInfo[u'sprice'] = stockBondInfo['sprice']
    
    stockInfo = getStockInfo(stockBondInfo['stock_id'])
    market_capital = float(stockInfo['market_capital']) #总股本
    newStockBondInfo[u'market_capital'] = market_capital if loadStockInfoFromCache == True else round(market_capital / 100000000, 2) #总市值，单位：亿

    gqzyInfo = getGqzyInfo(stockBondInfo['stock_id'])
    newStockBondInfo[u'gqzy_list'] = gqzyInfo
    newStockBondInfo[u'gqzy'] = round(float(gqzyInfo[0]['value']), 2) if len(gqzyInfo) > 0 else 0

    newStockBondInfo[u'force_redeem_price'] = -1 if stockBondInfo['force_redeem_price'] == "-" else float(stockBondInfo['force_redeem_price']) #强赎触发价
    newStockBondInfo[u'put_convert_price'] = -1 if stockBondInfo['put_convert_price'] == "-" else float(stockBondInfo['put_convert_price']) #回售触发价
    newStockBondInfo[u'redeem_price'] = float(stockBondInfo['redeem_price']) #赎回价
    newStockBondInfo[u'redeem_price_ratio'] = float(stockBondInfo['redeem_price_ratio']) #赎回触时转债的理论市场价格
    newStockBondInfo[u'orig_iss_amt'] = round(float(stockBondInfo['orig_iss_amt']), 2) #发行规模
    newStockBondInfo[u'curr_iss_amt'] = -1 if stockBondInfo['curr_iss_amt'] == "-" else round(float(stockBondInfo['curr_iss_amt']), 2) #剩余规模
    newStockBondInfo[u'convert_amt_ratio'] = round(float(stockBondInfo['convert_amt_ratio'].replace('%', '')), 2) #转债占比=转债余额/总市值
    newStockBondInfo[u'convert_dt'] = stockBondInfo['convert_dt'] #转股日期
    newStockBondInfo[u'maturity_dt'] = stockBondInfo['maturity_dt']  #到期日
    newStockBondInfo[u'redeem_count_days'] = stockBondInfo['redeem_count_days'] #赎回触发需要的连续交易日
    newStockBondInfo[u'redeem_total_days'] = stockBondInfo['redeem_total_days'] #赎回触发需要的有效最大交易日
    newStockBondInfo[u'rating_cd'] = stockBondInfo['rating_cd'] #评级
    newStockBondInfo[u'convert_cd'] = stockBondInfo['convert_cd'] #是否移到转股期
    newStockBondInfo[u'ytm_rt_tax'] = stockBondInfo['ytm_rt_tax']  #到期税后收益

    return newStockBondInfo


def downLoadStockBondInfos():
    stock_bond_list = getStockBondList()

    stock_bond_infos = []
    for stockBondLine in stock_bond_list:
        stock_bond_info = getStockBondInfo(stockBondLine)
        if stock_bond_info is not None:
            stock_bond_infos.append(stock_bond_info)

    return stock_bond_infos


def startDownload():

    stock_bond_infos = downLoadStockBondInfos()

    finalResult = json.dumps(stock_bond_infos, ensure_ascii=False)

    fp = codecs.open("mock/stockinfo/bond_infos.json", 'w', 'utf-8')
    fp.write(finalResult)
    fp.close()

    if loadStockInfoFromCache == False:
        fp = codecs.open("mock/stockinfo/bond_infos_cache.json", 'w', 'utf-8')
        fp.write(finalResult)
        fp.close()

    print '-----Done-----' + datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')


global loadStockInfoFromCache

loadStockInfoFromCache = False
startDownload()

loadStockInfoFromCache = True

while 1==1:
    startDownload()

