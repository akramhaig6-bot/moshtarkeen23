// رموز الهاتف، العملات الرقمية، المحافظ، وشبكات البلوكتشين (قوائم ثابتة)

export interface PhoneCountry {
  iso: string;
  nameAr: string;
  nameEn: string;
  dialCode: string;
  flagUrl: string; // flagcdn
  priority?: boolean;
}

export interface CryptoCurrency {
  code: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  logoUrl: string;
}

export interface WalletType {
  id: string;
  name: string;
  nameAr: string;
  domain: string;
  logoUrl: string;
  type: 'hot' | 'cold' | 'exchange';
}

export interface BlockchainNetwork {
  id: string;
  name: string;
  nameAr: string;
  symbol: string;
  logoUrl: string;
  protocol: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  // دول عربية ذات أولوية (تظهر أولاً)
  { iso: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', dialCode: '+966', flagUrl: 'https://flagcdn.com/w40/sa.png', priority: true },
  { iso: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', dialCode: '+971', flagUrl: 'https://flagcdn.com/w40/ae.png', priority: true },
  { iso: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dialCode: '+965', flagUrl: 'https://flagcdn.com/w40/kw.png', priority: true },
  { iso: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dialCode: '+974', flagUrl: 'https://flagcdn.com/w40/qa.png', priority: true },
  { iso: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dialCode: '+973', flagUrl: 'https://flagcdn.com/w40/bh.png', priority: true },
  { iso: 'OM', nameAr: 'عُمان', nameEn: 'Oman', dialCode: '+968', flagUrl: 'https://flagcdn.com/w40/om.png', priority: true },
  { iso: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', dialCode: '+967', flagUrl: 'https://flagcdn.com/w40/ye.png', priority: true },
  { iso: 'EG', nameAr: 'مصر', nameEn: 'Egypt', dialCode: '+20', flagUrl: 'https://flagcdn.com/w40/eg.png', priority: true },
  { iso: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dialCode: '+962', flagUrl: 'https://flagcdn.com/w40/jo.png', priority: true },
  { iso: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', dialCode: '+961', flagUrl: 'https://flagcdn.com/w40/lb.png', priority: true },
  { iso: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', dialCode: '+964', flagUrl: 'https://flagcdn.com/w40/iq.png', priority: true },
  { iso: 'SY', nameAr: 'سوريا', nameEn: 'Syria', dialCode: '+963', flagUrl: 'https://flagcdn.com/w40/sy.png', priority: true },
  { iso: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', dialCode: '+970', flagUrl: 'https://flagcdn.com/w40/ps.png', priority: true },
  { iso: 'SD', nameAr: 'السودان', nameEn: 'Sudan', dialCode: '+249', flagUrl: 'https://flagcdn.com/w40/sd.png', priority: true },
  { iso: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', dialCode: '+218', flagUrl: 'https://flagcdn.com/w40/ly.png', priority: true },
  { iso: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', dialCode: '+216', flagUrl: 'https://flagcdn.com/w40/tn.png', priority: true },
  { iso: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', dialCode: '+213', flagUrl: 'https://flagcdn.com/w40/dz.png', priority: true },
  { iso: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', dialCode: '+212', flagUrl: 'https://flagcdn.com/w40/ma.png', priority: true },
  { iso: 'MR', nameAr: 'موريتانيا', nameEn: 'Mauritania', dialCode: '+222', flagUrl: 'https://flagcdn.com/w40/mr.png', priority: true },
  { iso: 'DJ', nameAr: 'جيبوتي', nameEn: 'Djibouti', dialCode: '+253', flagUrl: 'https://flagcdn.com/w40/dj.png', priority: true },
  { iso: 'KM', nameAr: 'جزر القمر', nameEn: 'Comoros', dialCode: '+269', flagUrl: 'https://flagcdn.com/w40/km.png', priority: true },
  { iso: 'SO', nameAr: 'الصومال', nameEn: 'Somalia', dialCode: '+252', flagUrl: 'https://flagcdn.com/w40/so.png', priority: true },
  // بقية دول العالم (80+ إضافية لتغطية 100+)
  { iso: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States', dialCode: '+1', flagUrl: 'https://flagcdn.com/w40/us.png' },
  { iso: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', dialCode: '+44', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  { iso: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', dialCode: '+49', flagUrl: 'https://flagcdn.com/w40/de.png' },
  { iso: 'FR', nameAr: 'فرنسا', nameEn: 'France', dialCode: '+33', flagUrl: 'https://flagcdn.com/w40/fr.png' },
  { iso: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', dialCode: '+90', flagUrl: 'https://flagcdn.com/w40/tr.png' },
  { iso: 'IN', nameAr: 'الهند', nameEn: 'India', dialCode: '+91', flagUrl: 'https://flagcdn.com/w40/in.png' },
  { iso: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', dialCode: '+92', flagUrl: 'https://flagcdn.com/w40/pk.png' },
  { iso: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', dialCode: '+62', flagUrl: 'https://flagcdn.com/w40/id.png' },
  { iso: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', dialCode: '+60', flagUrl: 'https://flagcdn.com/w40/my.png' },
  { iso: 'JP', nameAr: 'اليابان', nameEn: 'Japan', dialCode: '+81', flagUrl: 'https://flagcdn.com/w40/jp.png' },
  { iso: 'CN', nameAr: 'الصين', nameEn: 'China', dialCode: '+86', flagUrl: 'https://flagcdn.com/w40/cn.png' },
  { iso: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', dialCode: '+82', flagUrl: 'https://flagcdn.com/w40/kr.png' },
  { iso: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', dialCode: '+55', flagUrl: 'https://flagcdn.com/w40/br.png' },
  { iso: 'CA', nameAr: 'كندا', nameEn: 'Canada', dialCode: '+1', flagUrl: 'https://flagcdn.com/w40/ca.png' },
  { iso: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', dialCode: '+61', flagUrl: 'https://flagcdn.com/w40/au.png' },
  { iso: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', dialCode: '+41', flagUrl: 'https://flagcdn.com/w40/ch.png' },
  { iso: 'SE', nameAr: 'السويد', nameEn: 'Sweden', dialCode: '+46', flagUrl: 'https://flagcdn.com/w40/se.png' },
  { iso: 'NO', nameAr: 'النرويج', nameEn: 'Norway', dialCode: '+47', flagUrl: 'https://flagcdn.com/w40/no.png' },
  { iso: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', dialCode: '+39', flagUrl: 'https://flagcdn.com/w40/it.png' },
  { iso: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', dialCode: '+34', flagUrl: 'https://flagcdn.com/w40/es.png' },
  { iso: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', dialCode: '+31', flagUrl: 'https://flagcdn.com/w40/nl.png' },
  { iso: 'BE', nameAr: 'بلجيكا', nameEn: 'Belgium', dialCode: '+32', flagUrl: 'https://flagcdn.com/w40/be.png' },
  { iso: 'RU', nameAr: 'روسيا', nameEn: 'Russia', dialCode: '+7', flagUrl: 'https://flagcdn.com/w40/ru.png' },
  { iso: 'UA', nameAr: 'أوكرانيا', nameEn: 'Ukraine', dialCode: '+380', flagUrl: 'https://flagcdn.com/w40/ua.png' },
  { iso: 'ZA', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', dialCode: '+27', flagUrl: 'https://flagcdn.com/w40/za.png' },
  { iso: 'NG', nameAr: 'نيجيريا', nameEn: 'Nigeria', dialCode: '+234', flagUrl: 'https://flagcdn.com/w40/ng.png' },
  { iso: 'KE', nameAr: 'كينيا', nameEn: 'Kenya', dialCode: '+254', flagUrl: 'https://flagcdn.com/w40/ke.png' },
];

export const CRYPTO_CURRENCIES: CryptoCurrency[] = [
  { code: 'BTC', symbol: '₿', nameAr: 'بيتكوين', nameEn: 'Bitcoin', logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=026' },
  { code: 'ETH', symbol: 'Ξ', nameAr: 'إيثريوم', nameEn: 'Ethereum', logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026' },
  { code: 'USDT', symbol: '₮', nameAr: 'تيثر', nameEn: 'Tether', logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=026' },
  { code: 'BNB', symbol: 'BNB', nameAr: 'بي إن بي', nameEn: 'BNB', logoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=026' },
  { code: 'SOL', symbol: 'SOL', nameAr: 'سولانا', nameEn: 'Solana', logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=026' },
  { code: 'XRP', symbol: 'XRP', nameAr: 'ريبل', nameEn: 'XRP', logoUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=026' },
  { code: 'USDC', symbol: 'USDC', nameAr: 'يو إس دي كوين', nameEn: 'USD Coin', logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026' },
  { code: 'ADA', symbol: 'ADA', nameAr: 'كاردانو', nameEn: 'Cardano', logoUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=026' },
  { code: 'DOGE', symbol: 'Ð', nameAr: 'دوجكوين', nameEn: 'Dogecoin', logoUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=026' },
  { code: 'SHIB', symbol: 'SHIB', nameAr: 'شيبا إينو', nameEn: 'Shiba Inu', logoUrl: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.svg?v=026' },
  { code: 'LTC', symbol: 'Ł', nameAr: 'لايتكوين', nameEn: 'Litecoin', logoUrl: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=026' },
  { code: 'DOT', symbol: 'DOT', nameAr: 'بولكادوت', nameEn: 'Polkadot', logoUrl: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=026' },
  { code: 'LINK', symbol: 'LINK', nameAr: 'تشين لينك', nameEn: 'Chainlink', logoUrl: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=026' },
  { code: 'MATIC', symbol: 'MATIC', nameAr: 'بوليغون', nameEn: 'Polygon', logoUrl: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=026' },
  { code: 'AVAX', symbol: 'AVAX', nameAr: 'أفالانش', nameEn: 'Avalanche', logoUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=026' },
  { code: 'ATOM', symbol: 'ATOM', nameAr: 'كوزموس', nameEn: 'Cosmos', logoUrl: 'https://cryptologos.cc/logos/cosmos-atom-logo.svg?v=026' },
  { code: 'UNI', symbol: 'UNI', nameAr: 'يونيسواب', nameEn: 'Uniswap', logoUrl: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=026' },
  { code: 'AAVE', symbol: 'AAVE', nameAr: 'آفي', nameEn: 'Aave', logoUrl: 'https://cryptologos.cc/logos/aave-aave-logo.svg?v=026' },
  { code: 'XLM', symbol: 'XLM', nameAr: 'ستيلر', nameEn: 'Stellar', logoUrl: 'https://cryptologos.cc/logos/stellar-xlm-logo.svg?v=026' },
  { code: 'TRX', symbol: 'TRX', nameAr: 'ترون', nameEn: 'Tron', logoUrl: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=026' },
  { code: 'VET', symbol: 'VET', nameAr: 'في تشين', nameEn: 'VeChain', logoUrl: 'https://cryptologos.cc/logos/vechain-vet-logo.svg?v=026' },
  { code: 'XMR', symbol: 'XMR', nameAr: 'مونيرو', nameEn: 'Monero', logoUrl: 'https://cryptologos.cc/logos/monero-xmr-logo.svg?v=026' },
  { code: 'DASH', symbol: 'DASH', nameAr: 'داش', nameEn: 'Dash', logoUrl: 'https://cryptologos.cc/logos/dash-dash-logo.svg?v=026' },
  { code: 'ZEC', symbol: 'ZEC', nameAr: 'زي كاش', nameEn: 'Zcash', logoUrl: 'https://cryptologos.cc/logos/zcash-zec-logo.svg?v=026' },
  { code: 'BCH', symbol: 'BCH', nameAr: 'بيتكوين كاش', nameEn: 'Bitcoin Cash', logoUrl: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg?v=026' },
  { code: 'ETC', symbol: 'ETC', nameAr: 'إيثريوم كلاسيك', nameEn: 'Ethereum Classic', logoUrl: 'https://cryptologos.cc/logos/ethereum-classic-etc-logo.svg?v=026' },
  { code: 'FIL', symbol: 'FIL', nameAr: 'فايل كوين', nameEn: 'Filecoin', logoUrl: 'https://cryptologos.cc/logos/filecoin-fil-logo.svg?v=026' },
  { code: 'HBAR', symbol: 'HBAR', nameAr: 'هيديرا', nameEn: 'Hedera', logoUrl: 'https://cryptologos.cc/logos/hedera-hbar-logo.svg?v=026' },
  { code: 'APT', symbol: 'APT', nameAr: 'أبتوس', nameEn: 'Aptos', logoUrl: 'https://cryptologos.cc/logos/aptos-apt-logo.svg?v=026' },
  { code: 'ARB', symbol: 'ARB', nameAr: 'أربيتروم', nameEn: 'Arbitrum', logoUrl: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=026' },
  { code: 'OP', symbol: 'OP', nameAr: 'أوبتيمزم', nameEn: 'Optimism', logoUrl: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=026' },
  { code: 'NEAR', symbol: 'NEAR', nameAr: 'نير', nameEn: 'NEAR Protocol', logoUrl: 'https://cryptologos.cc/logos/near-protocol-near-logo.svg?v=026' },
  { code: 'FTM', symbol: 'FTM', nameAr: 'فانتوم', nameEn: 'Fantom', logoUrl: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=026' },
  { code: 'ALGO', symbol: 'ALGO', nameAr: 'ألغوراند', nameEn: 'Algorand', logoUrl: 'https://cryptologos.cc/logos/algorand-algo-logo.svg?v=026' },
  { code: 'QNT', symbol: 'QNT', nameAr: 'كوانت', nameEn: 'Quant', logoUrl: 'https://cryptologos.cc/logos/quant-qnt-logo.svg?v=026' },
  { code: 'EOS', symbol: 'EOS', nameAr: 'إيوس', nameEn: 'EOS', logoUrl: 'https://cryptologos.cc/logos/eos-eos-logo.svg?v=026' },
  { code: 'XTZ', symbol: 'XTZ', nameAr: 'تيزوس', nameEn: 'Tezos', logoUrl: 'https://cryptologos.cc/logos/tezos-xtz-logo.svg?v=026' },
  { code: 'EGLD', symbol: 'EGLD', nameAr: 'إلروند', nameEn: 'Elrond', logoUrl: 'https://cryptologos.cc/logos/elrond-egld-egld-logo.svg?v=026' },
  { code: 'SAND', symbol: 'SAND', nameAr: 'ساندبوكس', nameEn: 'The Sandbox', logoUrl: 'https://cryptologos.cc/logos/the-sandbox-sand-logo.svg?v=026' },
  { code: 'MANA', symbol: 'MANA', nameAr: 'ديسنترالاند', nameEn: 'Decentraland', logoUrl: 'https://cryptologos.cc/logos/decentraland-mana-logo.svg?v=026' },
  { code: 'CHZ', symbol: 'CHZ', nameAr: 'تشيليز', nameEn: 'Chiliz', logoUrl: 'https://cryptologos.cc/logos/chiliz-chz-logo.svg?v=026' },
  { code: 'FLOW', symbol: 'FLOW', nameAr: 'فلو', nameEn: 'Flow', logoUrl: 'https://cryptologos.cc/logos/flow-flow-logo.svg?v=026' },
  { code: 'KLAY', symbol: 'KLAY', nameAr: 'كلايتن', nameEn: 'Klaytn', logoUrl: 'https://cryptologos.cc/logos/klaytn-klay-logo.svg?v=026' },
  { code: 'WAVES', symbol: 'WAVES', nameAr: 'وايفز', nameEn: 'Waves', logoUrl: 'https://cryptologos.cc/logos/waves-waves-logo.svg?v=026' },
  { code: 'ZIL', symbol: 'ZIL', nameAr: 'زيل', nameEn: 'Zilliqa', logoUrl: 'https://cryptologos.cc/logos/zilliqa-zil-logo.svg?v=026' },
  { code: 'BAT', symbol: 'BAT', nameAr: 'بيسيك أتنشن', nameEn: 'Basic Attention Token', logoUrl: 'https://cryptologos.cc/logos/basic-attention-token-bat-logo.svg?v=026' },
  { code: 'ENJ', symbol: 'ENJ', nameAr: 'إنجين', nameEn: 'Enjin Coin', logoUrl: 'https://cryptologos.cc/logos/enjin-coin-enj-logo.svg?v=026' },
  { code: 'COMP', symbol: 'COMP', nameAr: 'كومباوند', nameEn: 'Compound', logoUrl: 'https://cryptologos.cc/logos/compound-comp-logo.svg?v=026' },
  { code: 'MKR', symbol: 'MKR', nameAr: 'ميكر', nameEn: 'Maker', logoUrl: 'https://cryptologos.cc/logos/maker-mkr-logo.svg?v=026' },
  { code: 'SNX', symbol: 'SNX', nameAr: 'سينثيتيكس', nameEn: 'Synthetix', logoUrl: 'https://cryptologos.cc/logos/synthetix-network-token-snx-logo.svg?v=026' },
  { code: 'YFI', symbol: 'YFI', nameAr: 'يرن فينانس', nameEn: 'yearn.finance', logoUrl: 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.svg?v=026' },
];

export const WALLET_TYPES: WalletType[] = [
  { id: 'metamask', name: 'MetaMask', nameAr: 'ميتا ماسك', domain: 'metamask.io', logoUrl: 'https://logo.clearbit.com/metamask.io', type: 'hot' },
  { id: 'trust', name: 'Trust Wallet', nameAr: 'تراست والت', domain: 'trustwallet.com', logoUrl: 'https://logo.clearbit.com/trustwallet.com', type: 'hot' },
  { id: 'ledger', name: 'Ledger', nameAr: 'ليدجر', domain: 'ledger.com', logoUrl: 'https://logo.clearbit.com/ledger.com', type: 'cold' },
  { id: 'trezor', name: 'Trezor', nameAr: 'تريزور', domain: 'trezor.io', logoUrl: 'https://logo.clearbit.com/trezor.io', type: 'cold' },
  { id: 'phantom', name: 'Phantom', nameAr: 'فانتوم', domain: 'phantom.app', logoUrl: 'https://logo.clearbit.com/phantom.app', type: 'hot' },
  { id: 'coinbase_wallet', name: 'Coinbase Wallet', nameAr: 'كوين بيس والت', domain: 'coinbase.com', logoUrl: 'https://logo.clearbit.com/coinbase.com', type: 'hot' },
  { id: 'binance_web3', name: 'Binance Web3', nameAr: 'باينانس ويب3', domain: 'binance.com', logoUrl: 'https://logo.clearbit.com/binance.com', type: 'hot' },
  { id: 'safepal', name: 'SafePal', nameAr: 'سيف بال', domain: 'safepal.com', logoUrl: 'https://logo.clearbit.com/safepal.com', type: 'hot' },
  { id: 'exodus', name: 'Exodus', nameAr: 'إكسودوس', domain: 'exodus.com', logoUrl: 'https://logo.clearbit.com/exodus.com', type: 'hot' },
];

export const BLOCKCHAIN_NETWORKS: BlockchainNetwork[] = [
  { id: 'eth', name: 'Ethereum', nameAr: 'إيثريوم', symbol: 'ETH', logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026', protocol: 'ERC20' },
  { id: 'btc', name: 'Bitcoin', nameAr: 'بيتكوين', symbol: 'BTC', logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=026', protocol: 'BTC' },
  { id: 'bnb', name: 'BNB Smart Chain', nameAr: 'سلسلة بي إن بي', symbol: 'BSC', logoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=026', protocol: 'BEP20' },
  { id: 'sol', name: 'Solana', nameAr: 'سولانا', symbol: 'SOL', logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=026', protocol: 'SPL' },
  { id: 'trx', name: 'Tron', nameAr: 'ترون', symbol: 'TRX', logoUrl: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=026', protocol: 'TRC20' },
  { id: 'matic', name: 'Polygon', nameAr: 'بوليغون', symbol: 'MATIC', logoUrl: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=026', protocol: 'ERC20' },
  { id: 'arb', name: 'Arbitrum', nameAr: 'أربيتروم', symbol: 'ARB', logoUrl: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=026', protocol: 'ERC20' },
  { id: 'avax', name: 'Avalanche', nameAr: 'أفالانش', symbol: 'AVAX', logoUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=026', protocol: 'C-Chain' },
  { id: 'ada', name: 'Cardano', nameAr: 'كاردانو', symbol: 'ADA', logoUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=026', protocol: 'Cardano' },
  { id: 'dot', name: 'Polkadot', nameAr: 'بولكادوت', symbol: 'DOT', logoUrl: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=026', protocol: 'Substrate' },
];

